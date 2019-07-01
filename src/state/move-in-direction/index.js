// @flow
import type { Position } from 'css-box-model';
import type { PublicResult } from './move-in-direction-types';
import type {
  DroppableId,
  DraggingState,
  Direction,
  DroppableDimension,
  DraggableDimension,
  DroppableDimensionMap,
  DragImpact,
} from '../../types';
import moveToNextPlace from './move-to-next-place';
import moveCrossAxis from './move-cross-axis';
import whatIsDraggedOver from '../droppable/what-is-dragged-over';

type Args = {|
  state: DraggingState,
  type: 'MOVE_UP' | 'MOVE_RIGHT' | 'MOVE_DOWN' | 'MOVE_LEFT',
|};

const getDroppableOver = (
  impact: DragImpact,
  droppables: DroppableDimensionMap,
): ?DroppableDimension => {
  const id: ?DroppableId = whatIsDraggedOver(impact);
  return id ? droppables[id] : null;
};

export default ({ state, type }: Args): ?PublicResult => {
  const isActuallyOver: ?DroppableDimension = getDroppableOver(
    state.impact,
    state.dimensions.droppables,
  );
  const isMainAxisMovementAllowed: boolean = Boolean(isActuallyOver);
  const home: DroppableDimension =
    state.dimensions.droppables[state.critical.droppable.id];
  // use home when not actually over a droppable (can happen when move is disabled)
  let isOver: DroppableDimension = isActuallyOver || home;

  const direction: Direction = isOver.axis.direction;
  const isMovingOnMainAxis: boolean =
    (direction === 'vertical' &&
      (type === 'MOVE_UP' || type === 'MOVE_DOWN')) ||
    (direction === 'horizontal' &&
      (type === 'MOVE_LEFT' || type === 'MOVE_RIGHT'));

  // This movement is not permitted right now
  if (isMovingOnMainAxis && !isMainAxisMovementAllowed) {
    return null;
  }

  const isMovingForward: boolean =
    type === 'MOVE_DOWN' || type === 'MOVE_RIGHT';

  const draggable: DraggableDimension =
    state.dimensions.draggables[state.critical.draggable.id];
  const previousPageBorderBoxCenter: Position =
    state.current.page.borderBoxCenter;
  const { draggables, droppables } = state.dimensions;

  if(type === 'MOVE_UP' && state.impact.destination.index === 0) {
    let droppableId = state.impact.destination.droppableId;
    let droppablesSortedByY = Object.values(droppables).sort(function(a, b) {
      if (a.subject.active.top < b.subject.active.top) {
        return -1;
      }
      if (a.subject.active.top > b.subject.active.top) {
        return 1;
      }
      return 0;
    });
    console.log("droppablesSortedByY:", droppablesSortedByY);
    let myDroppableIndex = droppablesSortedByY.findIndex(function(droppable) {
        return droppable.descriptor.id === droppableId;
    });
    console.log("myDroppableIndex:", myDroppableIndex);
    isOver = droppablesSortedByY[myDroppableIndex > 0 ? myDroppableIndex - 1 : 0];
    console.log("isOver:", isOver);
  }

  return isMovingOnMainAxis
    ? moveToNextPlace({
        isMovingForward,
        previousPageBorderBoxCenter,
        draggable,
        destination: isOver,
        draggables,
        viewport: state.viewport,
        previousClientSelection: state.current.client.selection,
        previousImpact: state.impact,
        onLift: state.onLift,
      })
    : moveCrossAxis({
        isMovingForward,
        previousPageBorderBoxCenter,
        draggable,
        isOver,
        draggables,
        droppables,
        previousImpact: state.impact,
        viewport: state.viewport,
        onLift: state.onLift,
      });
};
