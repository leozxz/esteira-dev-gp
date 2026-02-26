export type StateChangeCallback = (currentStep: number, completedSteps: number[]) => void;

export class StepStateManager {
    private _currentStep: number = 1;
    private _completedSteps: Set<number> = new Set();
    private _onChange: StateChangeCallback | undefined;

    constructor(private readonly _totalSteps: number) {}

    onStateChange(callback: StateChangeCallback): void {
        this._onChange = callback;
    }

    completeStep(stepNumber: number): void {
        this._completedSteps.add(stepNumber);
        if (stepNumber < this._totalSteps) {
            this._currentStep = stepNumber + 1;
        }
        this._notify();
    }

    getCurrentStep(): number {
        return this._currentStep;
    }

    getCompletedSteps(): number[] {
        return Array.from(this._completedSteps);
    }

    reset(): void {
        this._currentStep = 1;
        this._completedSteps.clear();
        this._notify();
    }

    private _notify(): void {
        this._onChange?.(this._currentStep, this.getCompletedSteps());
    }
}
