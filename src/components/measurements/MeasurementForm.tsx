import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMeasurements } from '@/store/useMeasurements'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { BodyMeasurements } from '@/types'

const formSchema = z.object({
  name: z.string().min(1, 'Обязательное поле'),
  height: z.number().min(50).max(250),
  bust: z.number().min(30).max(200),
  underBust: z.number().min(25).max(180),
  waist: z.number().min(30).max(200),
  hip: z.number().min(30).max(250),
  shoulderWidth: z.number().min(10).max(80),
  backWidth: z.number().min(10).max(80),
  armLength: z.number().min(20).max(100),
  armCircumference: z.number().min(10).max(80),
  wrist: z.number().min(8).max(40),
  neck: z.number().min(20).max(80),
  frontWaistLength: z.number().min(20).max(80),
  backWaistLength: z.number().min(20).max(80),
  inseam: z.number().min(30).max(120),
  thigh: z.number().min(20).max(120),
  knee: z.number().min(15).max(80),
  calf: z.number().min(15).max(80),
  ankle: z.number().min(10).max(60),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface Props {
  item?: BodyMeasurements
  onClose: () => void
}

const groups = [
  { key: 'basic', labelKey: 'measurements.basic', fields: ['height', 'bust', 'underBust', 'waist', 'hip'] as const },
  { key: 'shoulderArm', labelKey: 'measurements.shoulderArm', fields: ['shoulderWidth', 'backWidth', 'armLength', 'armCircumference', 'wrist', 'neck'] as const },
  { key: 'leg', labelKey: 'measurements.leg', fields: ['inseam', 'thigh', 'knee', 'calf', 'ankle'] as const },
] as const

type FieldName = keyof FormData

export function MeasurementForm({ item, onClose }: Props) {
  const { t } = useTranslation()
  const { create, update } = useMeasurements()

  const defaultValues: FormData = {
    name: item?.name || '',
    height: item?.height ?? 165,
    bust: item?.bust ?? 90,
    underBust: item?.underBust ?? 75,
    waist: item?.waist ?? 68,
    hip: item?.hip ?? 96,
    shoulderWidth: item?.shoulderWidth ?? 38,
    backWidth: item?.backWidth ?? 34,
    armLength: item?.armLength ?? 58,
    armCircumference: item?.armCircumference ?? 28,
    wrist: item?.wrist ?? 15,
    neck: item?.neck ?? 35,
    frontWaistLength: item?.frontWaistLength ?? 42,
    backWaistLength: item?.backWaistLength ?? 40,
    inseam: item?.inseam ?? 78,
    thigh: item?.thigh ?? 54,
    knee: item?.knee ?? 36,
    calf: item?.calf ?? 34,
    ankle: item?.ankle ?? 22,
    notes: item?.notes || '',
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const onSubmit = (data: FormData) => {
    if (item) {
      update(item.id, data)
    } else {
      create(data.name, data)
    }
    onClose()
  }

  const numberRegister = (field: FieldName) => {
    const { onChange, ...rest } = register(field, { valueAsNumber: true })
    return {
      ...rest,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value === '' ? '' : e.target.value
        onChange(e)
      },
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="name">{t('common.name')}</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      {groups.map((group) => (
        <div key={group.key}>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{t(group.labelKey)}</h3>
          <div className="grid grid-cols-3 gap-3">
            {group.fields.map((field) => (
              <div key={field}>
                <Label htmlFor={field}>{t(`measurements.${field}`)}</Label>
                <Input id={field} type="number" step="0.1" {...numberRegister(field)} />
                {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]?.message}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="frontWaistLength">{t('measurements.frontWaistLength')}</Label>
          <Input id="frontWaistLength" type="number" step="0.1" {...numberRegister('frontWaistLength')} />
        </div>
        <div>
          <Label htmlFor="backWaistLength">{t('measurements.backWaistLength')}</Label>
          <Input id="backWaistLength" type="number" step="0.1" {...numberRegister('backWaistLength')} />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">{t('common.notes')}</Label>
        <Input id="notes" {...register('notes')} />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
        <Button type="submit">{t('common.save')}</Button>
      </div>
    </form>
  )
}
