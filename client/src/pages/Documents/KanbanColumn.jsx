// components/Documents/KanbanColumn.jsx
import { Empty, Badge } from "antd";
import DocumentCard from "./DocumentCard";

/**
 * KanbanColumn component to display documents by status
 *
 * @param {Object} props
 * @param {string} props.status - Status key (pending, approved, etc.)
 * @param {Object} props.config - Status configuration (label, icon, colors)
 * @param {Array} props.documents - Array of documents in this column
 * @param {Function} props.onView - Callback for viewing a document
 * @param {Function} props.onEdit - Callback for editing a document
 * @param {Function} props.onDelete - Callback for deleting a document
 * @param {Function} props.onReview - Callback for reviewing a document
 */
const KanbanColumn = ({
  status,
  config,
  documents = [],
  onView,
  onEdit,
  onDelete,
  onReview,
}) => (
  <div className="kanban-column">
    {/* Column Header */}
    <div className="kanban-header" style={{ backgroundColor: config.bgColor }}>
      <div className="kanban-title">
        {config.icon}
        <span>{config.label}</span>
      </div>
      <Badge
        count={documents.length}
        style={{ backgroundColor: config.color }}
      />
    </div>

    {/* Column Body */}
    <div className="kanban-body">
      {documents.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No documents"
          className="kanban-empty"
        />
      ) : (
        documents.map((doc) => (
          <DocumentCard
            key={doc._id}
            doc={doc}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onReview={onReview}
          />
        ))
      )}
    </div>
  </div>
);

export default KanbanColumn;
