import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../../api/ApiError'
import type { Resource } from '../../api/types'
import { Banner, Row, Stack } from '../../components/ui'
import { SelectField } from '../../components/SelectField'
import { Button, CheckboxGroup, Input } from '../../design-system'
import { useEditBuffer } from './editBuffer'
import { useUpdateProjectDetails } from './queries'
import { isCompleted } from './rules'
import {
  CATEGORIES,
  TEAM_MEMBERS,
  projectDetailsSchema,
  type ProjectDetailsOutput,
  type ProjectDetailsValues,
} from './schemas'

const CATEGORY_OPTIONS = [
  { value: '', label: 'Select category' },
  ...CATEGORIES.map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
  })),
]

/** Same draft/completed split as BasicInfoForm (PATCH vs. local buffer). */
export const ProjectDetailsForm = ({ resource }: { resource: Resource }) => {
  const id = String(resource.resourceId)
  const navigate = useNavigate()
  const completed = isCompleted(resource)
  const buffered = useEditBuffer((s) => s.buffers[id]?.projectDetails)
  const setBuffer = useEditBuffer((s) => s.setProjectDetails)
  const update = useUpdateProjectDetails(id)

  const source = buffered ?? resource.projectDetails
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectDetailsValues, unknown, ProjectDetailsOutput>({
    resolver: zodResolver(projectDetailsSchema),
    defaultValues: {
      projectName: source.projectName,
      budget: source.budget,
      category: (source.category || undefined) as
        | ProjectDetailsValues['category']
        | undefined,
      options: source.options as ProjectDetailsValues['options'],
    },
    mode: 'onTouched',
  })

  const goBack = () => navigate(`/resources/${id}`)

  const onSubmit = async (values: ProjectDetailsOutput) => {
    if (completed) {
      setBuffer(id, values)
      goBack()
      return
    }
    await update.mutateAsync(values).then(goBack, () => undefined)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack>
        <Input
          label="Project name"
          error={errors.projectName?.message}
          {...register('projectName')}
        />
        <Input
          label="Budget"
          inputMode="numeric"
          error={errors.budget?.message}
          {...register('budget')}
        />
        <SelectField
          label="Category"
          options={CATEGORY_OPTIONS}
          error={errors.category?.message}
          {...register('category')}
        />
        <Controller
          control={control}
          name="options"
          render={({ field }) => (
            <CheckboxGroup
              label="Team members"
              options={[...TEAM_MEMBERS]}
              value={field.value ?? []}
              onChange={field.onChange}
              error={errors.options?.message}
            />
          )}
        />
        {update.isError ? (
          <Banner $tone="error" role="alert">
            {getErrorMessage(update.error)}
          </Banner>
        ) : null}
        <Row>
          <Button type="submit" state={isSubmitting ? 'disabled' : 'normal'}>
            {completed ? 'Save changes' : 'Save'}
          </Button>
          <Button type="button" variant="ghost" onClick={goBack}>
            Cancel
          </Button>
        </Row>
        {completed ? (
          <Banner>
            Changes to a completed resource are kept locally until you submit
            them from the overview page.
          </Banner>
        ) : null}
      </Stack>
    </form>
  )
}
