
import type { TaskInput, Coding, Task } from '@medplum/fhirtypes'

import { ArrowDown, Check } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import { useMedplum } from '../../../../domains/medplum/MedplumClientProvider'
import { Button } from '../../../../components/ui'
import { useTasks } from '../contexts/tasks-context'


const TaskApproval = () => {
  const { updateTaskStatus } = useMedplum()
  const { updateTask, getSelectedTask } = useTasks()
  const task = getSelectedTask()
  
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  if (!task) return <div>Task not found</div>

  const taskId = task.id

  const handleApprove = async () => {
    if (!taskId) return

    setIsUpdating(true)
    setError(null)

    try {
      await updateTaskStatus(taskId, 'completed')
      updateTask(taskId, { status: 'completed' })

      setIsSubmitted(true)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to approve task'
      setError(errorMessage)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleReject = async () => {
    if (!taskId) return

    setIsUpdating(true)
    setError(null)

    try {
      await updateTaskStatus(taskId, 'cancelled')
      updateTask(taskId, { status: 'cancelled' })
      setIsSubmitted(true)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to reject task'
      setError(errorMessage)
    } finally {
      setIsUpdating(false)
    }
  }

  const matchedDataPayload = task.input?.find((input: TaskInput) =>
    input.type?.coding?.some(
      (coding: Coding) => coding.code === 'matched-patient-summary',
    ),
  )

  const incomingDataPayload = task.input?.find((input: TaskInput) =>
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
        <div className="p-3 border-b border-gray-200 text-sm font-medium text-gray-900">{title}</div>
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

  const isRequested = task.status === 'requested'

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
                className="text-sm"
                style={{ fontFamily: "Lato, system-ui, sans-serif" }}
              >
                Reject
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleApprove}
                disabled={isUpdating}
                className="text-sm"
                style={{ fontFamily: "Lato, system-ui, sans-serif" }}
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
