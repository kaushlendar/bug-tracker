
function KanbanBoard({ issues, onStatusChange }) {
  const columns = [
    { title: 'To Do', status: 'Open' },
    { title: 'In Progress', status: 'In Progress' },
    { title: 'Done', status: 'Resolved' }
  ];

  return (
    <div className="kanban-board">
      {columns.map((column) => {
        const columnIssues = issues.filter((issue) =>
          column.status === 'Resolved'
            ? ['Resolved', 'Closed'].includes(issue.status)
            : issue.status === column.status
        );

        return (
          <div
  className="kanban-column"
  key={column.status}
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => {
    const issueId = e.dataTransfer.getData('issueId');

    if (issueId) {
      onStatusChange(issueId, column.status);
    }
  }}
>
            <h3>
              {column.title} ({columnIssues.length})
            </h3>

            {columnIssues.map((issue) => (
              <div
  className="kanban-card"
  key={issue._id}
  draggable
  onDragStart={(e) => {
    e.dataTransfer.setData('issueId', issue._id);
  }}
>
                <h4>{issue.title}</h4>
                <p>{issue.description}</p>
                <p>
  Priority:
  <span className={`priority-badge priority-${issue.priority.toLowerCase()}`}>
    {issue.priority}
  </span>
</p>

                <select
                  value={issue.status}
                  onChange={(e) =>
                    onStatusChange(issue._id, e.target.value)
                  }
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            ))}

            {columnIssues.length === 0 && (
              <p>No issues here</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default KanbanBoard;
