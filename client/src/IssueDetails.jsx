
function IssueDetails({ issue, onBack }) {
  if (!issue) {
    return <p>Issue not found.</p>;
  }

  return (
    <div className="issue-details">
      <button className="add-btn" onClick={onBack}>
        Back to Dashboard
      </button>

      <h2>{issue.title}</h2>

      <p><strong>Description:</strong> {issue.description}</p>
      <p><strong>Status:</strong> {issue.status}</p>
      <p><strong>Priority:</strong> {issue.priority}</p>
      <p>
        <strong>Created By:</strong>{' '}
        {issue.createdBy?.name || 'Unknown'}
      </p>
      <p>
        <strong>Created At:</strong>{' '}
        {issue.createdAt
          ? new Date(issue.createdAt).toLocaleString('en-IN')
          : 'Not available'}
      </p>

      <hr />

      <h3>Comments</h3>

      {issue.comments?.length > 0 ? (
        issue.comments.map((comment, index) => (
          <div className="activity-item" key={comment._id || index}>
            <p>{comment.text}</p>
            <small>
              By: {comment.commentedBy?.name || 'Unknown'}
            </small>
          </div>
        ))
      ) : (
        <p>No comments yet.</p>
      )}
    </div>
  );
}

export default IssueDetails;
