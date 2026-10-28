import LoadingState, { LoadingSkeleton } from './LoadingState';
export const TableSkeleton = ({ rows = 5, cols = 5, label = 'Loading records', ...props }) => <LoadingState variant="table" rows={rows} cols={cols} label={label} {...props} />;
export const CardSkeleton = ({ count = 3, label = 'Loading records', ...props }) => <LoadingState variant="cards" count={count} label={label} {...props} />;
export const StatSkeleton = ({ count = 4, label = 'Loading summary', ...props }) => <LoadingState variant="stats" count={count} label={label} {...props} />;
export default LoadingSkeleton;
