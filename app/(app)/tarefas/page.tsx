import Topbar from '@/components/ui/Topbar'

export default function TarefasPage() {
  return (
    <>
      <Topbar title="Tarefas" />
      <main
        style={{
          flex: 1,
          padding: '1.5rem',
          overflowY: 'auto',
          color: 'var(--text-secondary)',
        }}
      >
        <p>Módulo Tarefas / Kanban — em breve</p>
      </main>
    </>
  )
}
