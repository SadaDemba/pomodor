export class Timer {
    public workDuration: number;
    public remainingTime: number;
    public breakDuration: number;
    public isActive: boolean;
    public isClosed: boolean;
    public iterations: number;
    public startedAt?: Date;
    public timer: any;
    public currentMode: Mode;


    constructor(workDuration: number, breakDuration: number) {
        this.workDuration = workDuration;
        this.remainingTime = workDuration;
        this.breakDuration = breakDuration;
        this.isActive = false;
        this.isClosed = false;
        this.iterations = 1;
        this.timer = null;
        this.currentMode = Mode.Focus;
    }
}

export enum Mode {
    "Focus",
    "Relax"
}