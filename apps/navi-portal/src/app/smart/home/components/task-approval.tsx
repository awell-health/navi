
import type { TaskInput, Coding, Task } from '@medplum/fhirtypes'

import { ArrowDown, Check } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import { useMedplum } from '../../../../domains/medplum/MedplumClientProvider'
import { Button } from '../../../../components/ui'

interface ApproveRejectTaskProps {
  task: Task;
  onSubmit: () => void;
}

const TaskApproval = ({ task, onSubmit }: ApproveRejectTaskProps) => {
  const { updateTaskStatus } = useMedplum()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localTask, setLocalTask] = useState<Task>(task)

  const handleApprove = async () => {
    if (!localTask.id) return

    setIsUpdating(true)
    setError(null)

    try {
      const updatedTask = await updateTaskStatus(localTask.id, 'completed')
      setLocalTask(updatedTask)
      setIsSubmitted(true)
      onSubmit()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to approve task'
      setError(errorMessage)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleReject = async () => {
    if (!localTask.id) return

    setIsUpdating(true)
    setError(null)

    try {
      const updatedTask = await updateTaskStatus(localTask.id, 'cancelled')
      setLocalTask(updatedTask)
      setIsSubmitted(true)
      onSubmit()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to reject task'
      setError(errorMessage)
    } finally {
      setIsUpdating(false)
    }
  }

  const matchedDataPayload = localTask.input?.find((input: TaskInput) =>
    input.type?.coding?.some(
      (coding: Coding) => coding.code === 'matched-patient-summary',
    ),
  )

  const incomingDataPayload = localTask.input?.find((input: TaskInput) =>
    input.type?.coding?.some(
      (coding: Coding) => coding.code === 'incoming-payload',
    ),
  )

  const matchedData = JSON.parse(matchedDataPayload?.valueString || '{}')
  const incomingData = JSON.parse(incomingDataPayload?.valueString || '{}')

  const renderData = (
    title: string,
    data: Record<string, unknown>,
    keysMatch: string[],
  ) => {
    return (
      <div className="flex flex-col gap-2 border border-gray-200 rounded-md">
        <div className="p-3 border-b border-gray-200">{title}</div>
        <div className="flex flex-col gap-2 p-3">
          {Object.keys(data).map((key) => {
            const hasKeyMatch = keysMatch.includes(key)
            return (
              <div
                key={key}
                className={clsx('flex justify-between gap-2 text-xs')}
              >
                <span
                  className={clsx(
                    !hasKeyMatch && 'text-gray-600',
                    hasKeyMatch && 'text-primary font-medium',
                  )}
                >
                  {key}
                </span>
                <span>{String(data[key] || '-')}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const isRequested = localTask.status === 'requested'

  return (
    <div className="flex flex-col gap-2">
      {renderData('Incoming Data', incomingData, Object.keys(matchedData))}

      <div className="flex items-center justify-center">
        <ArrowDown className="h-4 w-4 text-primary" />
      </div>
      {renderData('Matched Data', matchedData, Object.keys(incomingData))}
      {error && (
        <div className="alert alert-error text-sm">
          <span>{error}</span>
        </div>
      )}
      {isRequested && !isSubmitted && (
        <div className="flex items-center justify-end gap-2">
          {!isUpdating && (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleReject}
                disabled={isUpdating}
              >
                Reject
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleApprove}
                disabled={isUpdating}
              >
                Approve
              </Button>
            </>
          )}
        </div>
      )}

      <div className="flex items-center justify-end">
        {isUpdating && <div className="loading loading-spinner loading-xs" />}
        {isSubmitted && !isUpdating && (
          <div className="text-xs flex items-center text-green-600 gap-1">
            <Check className="h-4 w-4" />
            Submitted
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskApproval
