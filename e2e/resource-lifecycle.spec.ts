import { expect, test } from '@playwright/test'

/**
 * One journey through the rules the assignment cares about most:
 * draft -> fill both modules -> provision -> buffered edits -> single PUT.
 */
test('resource lifecycle: draft, provision, buffered edit, single PUT', async ({
  page,
}) => {
  const name = `E2E ${Date.now()}`
  const writes: string[] = []
  page.on('request', (request) => {
    if (
      request.url().includes('/api/resources') &&
      request.method() !== 'GET'
    ) {
      writes.push(`${request.method()} ${new URL(request.url()).pathname}`)
    }
  })

  await test.step('unknown routes show a 404 page', async () => {
    await page.goto('/this/does/not/exist')
    await expect(
      page.getByRole('heading', { name: 'Page not found' }),
    ).toBeVisible()
  })

  await test.step('create a resource (invalid names are rejected)', async () => {
    await page.goto('/resources')
    await page.getByRole('button', { name: 'Create resource' }).click()
    const drawer = page.getByRole('dialog', { name: 'Create resource' })
    await drawer.getByLabel('Resource name').fill('bad_name!')
    await drawer.getByRole('button', { name: 'Create' }).click()
    await expect(drawer.getByText(/only letters, numbers/i)).toBeVisible()

    await drawer.getByLabel('Resource name').fill(name)
    await drawer.getByRole('button', { name: 'Create' }).click()
    await expect(page).toHaveURL(/\/resources\/\d+$/)
    await expect(page.getByRole('heading', { name })).toBeVisible()
  })

  await test.step('Project Details is locked until Basic Info is complete', async () => {
    await expect(page.getByText('Complete Basic Info to unlock.')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Provision resource' }),
    ).toBeDisabled()
  })

  await test.step('complete Basic Info', async () => {
    await page.getByRole('link', { name: 'Fill in Basic Info' }).click()
    await page.getByLabel('Owner').fill('Jane Doe')
    await page.getByLabel('Email').fill('jane@example.com')
    await page.getByLabel('Description').fill('End-to-end test resource')
    await page.getByLabel('Priority').selectOption({ label: 'High' })
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page).toHaveURL(/\/resources\/\d+$/)
  })

  await test.step('complete Project Details', async () => {
    await page.getByRole('link', { name: 'Fill in Project Details' }).click()
    await page.getByLabel('Project name').fill('Project One')
    await page.getByLabel('Budget').fill('5000')
    await page.getByLabel('Category').selectOption({ label: 'Internal' })
    await page.getByText('FE devs').click()
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page).toHaveURL(/\/resources\/\d+$/)
  })

  await test.step('provision: draft becomes completed', async () => {
    await page.getByRole('button', { name: 'Provision resource' }).click()
    await expect(
      page.getByText('This resource is completed and cannot be provisioned again.'),
    ).toBeVisible()
  })

  await test.step('editing a completed resource only buffers locally', async () => {
    writes.length = 0
    await page.getByRole('link', { name: 'Edit Basic Info' }).click()
    await page.getByLabel('Owner').fill('John Smith')
    await page.getByRole('button', { name: 'Save changes' }).click()

    await expect(page.getByText(/You have unsaved changes/)).toBeVisible()
    expect(writes).toEqual([])

    await page.getByRole('link', { name: 'View details' }).click()
    await expect(page.getByText('John Smith')).toBeVisible()
    await expect(page.getByText('Unsaved changes').first()).toBeVisible()
  })

  await test.step('submit sends exactly one full PUT', async () => {
    await page.getByRole('link', { name: 'Back to overview' }).click()
    await page.getByRole('button', { name: 'Submit changes' }).click()
    await expect(page.getByText(/You have unsaved changes/)).toBeHidden()
    expect(writes).toHaveLength(1)
    expect(writes[0]).toMatch(/^PUT \/api\/resources\//)
  })

  await test.step('clean up the resource created by this test', async () => {
    await page.goto('/resources')
    await page.getByLabel('Search by name').fill(name)
    await page.getByRole('button', { name: `Delete ${name}` }).click()
    await page
      .getByRole('dialog', { name: 'Delete resource' })
      .getByRole('button', { name: 'Delete' })
      .click()
    await expect(page.getByText('No resources match your filters.')).toBeVisible()
  })
})
