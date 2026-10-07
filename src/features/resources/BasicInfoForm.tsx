import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../../api/ApiError'
import type { Resource } from '../../api/types'
import { Banner, Row, Stack } from '../../components/ui'
import { SelectField } from '../../components/SelectField'
import { Button, Input } from '../../design-system'
import { useEditBuffer } from './editBuffer'
import { useUpdateBasicInfo } from './queries'
import { isCompleted } from './rules'
import {
  PRIORITIES,
  basicInfoFormSchema,
  type BasicInfoFormOutput,
  type BasicInfoFormValues,
} from './schemas'

const PRIORITY_OPTIONS = [
  { value: '', label: 'Select priority' },
  ...PRIORITIES.map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
  })),
]

/**
 * Draft resource: submit PATCHes the module.
 * Completed resource: submit only stores the edit in the local buffer;
 * nothing is sent until the user submits from the overview page.
 */
export function BasicInfoForm({ resource }: { resource: Resource }) {
  const id = String(resource.resourceId)
  const navigate = useNavigate()
  const completed = isCompleted(resource)
  const buffered = useEditBuffer((s) => s.buffers[id]?.basicInfo)
  const setBuffer = useEditBuffer((s) => s.setBasicInfo)
  const update = useUpdateBasicInfo(id)

  const source = buffered ?? resource.basicInfo
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BasicInfoFormValues, unknown, BasicInfoFormOutput>({
    resolver: zodResolver(basicInfoFormSchema),
    defaultValues: {
      owner: source.owner,
      email: source.email,
      description: source.description,
      priority: source.priority || undefined,
    },
    mode: 'onTouched',
  })

  const goBack = () => navigate(`/resources/${id}`)

  const onSubmit = async (values: BasicInfoFormOutput) => {
    const basicInfo = { ...values, resourceName: resource.name }
    if (completed) {
      setBuffer(id, basicInfo)
      goBack()
      return
    }
    await update.mutateAsync(basicInfo).then(goBack, () => undefined)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack>
        <Input
          label="Resource name"
          value={resource.name}
          state="locked"
          helperText="The name cannot be changed after creation."
          readOnly
        />
        <Input label="Owner" error={errors.owner?.message} {...register('owner')} />
        <Input
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Description"
          multiline
          error={errors.description?.message}
          {...register('description')}
        />
        <SelectField
          label="Priority"
          options={PRIORITY_OPTIONS}
          error={errors.priority?.message}
          {...register('priority')}
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
