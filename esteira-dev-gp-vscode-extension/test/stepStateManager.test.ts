import { describe, it, expect, vi } from 'vitest';
import { StepStateManager } from '../src/services/stepStateManager';

describe('StepStateManager', () => {
    it('should start at step 1', () => {
        const manager = new StepStateManager(5);
        expect(manager.getCurrentStep()).toBe(1);
    });

    it('should have no completed steps initially', () => {
        const manager = new StepStateManager(5);
        expect(manager.getCompletedSteps()).toEqual([]);
    });

    describe('completeStep', () => {
        it('should mark a step as completed', () => {
            const manager = new StepStateManager(5);
            manager.completeStep(1);
            expect(manager.getCompletedSteps()).toContain(1);
        });

        it('should advance current step after completing', () => {
            const manager = new StepStateManager(5);
            manager.completeStep(1);
            expect(manager.getCurrentStep()).toBe(2);
        });

        it('should not advance past total steps', () => {
            const manager = new StepStateManager(3);
            manager.completeStep(1);
            manager.completeStep(2);
            manager.completeStep(3);
            expect(manager.getCurrentStep()).toBe(3);
        });

        it('should accumulate completed steps', () => {
            const manager = new StepStateManager(5);
            manager.completeStep(1);
            manager.completeStep(2);
            manager.completeStep(3);
            expect(manager.getCompletedSteps()).toEqual([1, 2, 3]);
        });
    });

    describe('reset', () => {
        it('should reset to initial state', () => {
            const manager = new StepStateManager(5);
            manager.completeStep(1);
            manager.completeStep(2);
            manager.reset();
            expect(manager.getCurrentStep()).toBe(1);
            expect(manager.getCompletedSteps()).toEqual([]);
        });
    });

    describe('onStateChange', () => {
        it('should call callback when step is completed', () => {
            const callback = vi.fn();
            const manager = new StepStateManager(5);
            manager.onStateChange(callback);

            manager.completeStep(1);
            expect(callback).toHaveBeenCalledWith(2, [1]);
        });

        it('should call callback on reset', () => {
            const callback = vi.fn();
            const manager = new StepStateManager(5);
            manager.onStateChange(callback);

            manager.completeStep(1);
            callback.mockClear();

            manager.reset();
            expect(callback).toHaveBeenCalledWith(1, []);
        });
    });
});
