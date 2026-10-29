<template>
  <section v-if="goal && !editing" class="thread-goal-card" :class="`is-${goal.status}`">
    <div><strong>Goal · {{ statusLabel(goal.status) }}</strong><p>{{ goal.objective }}</p></div>
    <button type="button" aria-label="Edit goal" title="Edit goal" @click="open">Edit</button>
  </section>
  <section v-if="editing" class="thread-goal-editor" role="dialog" aria-label="Edit thread goal">
    <textarea v-model="objective" aria-label="Goal objective" rows="4" :disabled="saving" />
    <div class="thread-goal-editor-status" role="group" aria-label="Goal status">
      <button v-for="value in GOAL_STATUSES" :key="value" type="button" :class="{ 'is-active': status === value }"
        :aria-pressed="status === value" :disabled="saving" @click="status = value">{{ statusLabel(value) }}</button>
    </div>
    <p v-if="error" role="alert">{{ error }}</p>
    <div class="thread-goal-editor-actions">
      <button v-if="goal" type="button" :disabled="saving" @click="clear">Clear goal</button>
      <button type="button" :disabled="saving" @click="editing = false">Cancel</button>
      <button type="button" :disabled="saving || !objective.trim()" @click="save">{{ saving ? 'Saving…' : 'Save' }}</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { clearThreadGoal, getThreadGoal, GOAL_STATUSES, setThreadGoal, type GoalStatus, type ThreadGoal } from '../../api/threadGoals'

const props = defineProps<{ threadId: string; goal: ThreadGoal | null }>()
const emit = defineEmits<{ 'update:goal': [goal: ThreadGoal | null] }>()
const editing = ref(false)
const saving = ref(false)
const objective = ref('')
const status = ref<GoalStatus>('active')
const error = ref('')
let revision = 0
const statusLabel = (value: GoalStatus) => value.replace(/([A-Z])/g, ' $1').toLowerCase()

watch(() => props.threadId, async (threadId) => {
  const request = ++revision
  editing.value = false
  saving.value = false
  emit('update:goal', null)
  if (!threadId) return
  try {
    const goal = await getThreadGoal(threadId)
    if (request === revision) emit('update:goal', goal)
  } catch {
    // Older app servers do not expose goals; ordinary chat remains available.
  }
}, { immediate: true })

onBeforeUnmount(() => { ++revision })

function open() {
  objective.value = props.goal?.objective ?? ''
  status.value = props.goal?.status ?? 'active'
  error.value = ''
  editing.value = true
}

async function mutate(action: () => Promise<ThreadGoal | null>) {
  if (saving.value || !props.threadId) return
  const request = ++revision
  saving.value = true
  error.value = ''
  try {
    const goal = await action()
    if (request !== revision) return
    emit('update:goal', goal)
    editing.value = false
  } catch (cause) {
    if (request === revision) error.value = cause instanceof Error ? cause.message : 'Failed to update goal'
  } finally {
    if (request === revision) saving.value = false
  }
}
const save = () => mutate(() => setThreadGoal(props.threadId, objective.value.trim(), status.value))
const clear = () => mutate(async () => {
  if (!await clearThreadGoal(props.threadId)) throw new Error('The server did not clear the goal')
  return null
})
defineExpose({ open })
</script>
