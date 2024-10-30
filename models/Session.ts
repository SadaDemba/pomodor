import { Mode, Timer } from "./Timer";
import { getData } from "@/utils/LocalStorage"
import { durations } from "@/utils/defaultDurations";

export class Session {
    private id?: string;
    public focusedTime: number = 0;
    public relaxedTime: number = 0;
    public iterationsNumber: number = 1;
    public beginDate?: Date;
    public endDate: Date;
    public focusDuration: number = 0;
    public relaxDuration: number = 0;


    constructor(timer?: Timer, endDate: Date = new Date()) {
        if (timer) {
            this.iterationsNumber = timer.iterations;
            this.beginDate = timer.startedAt;
            this.setTimesFromTimer(timer);
            this.focusDuration = timer.workDuration;
            this.relaxDuration = timer.breakDuration;
        }
        this.endDate = endDate;

    }

    getId() {
        return this.id;
    }

    setTimesFromTimer(timer: Timer) {
        if (timer.currentMode === Mode.Focus) {
            console.log(this.focusDuration);

            this.focusedTime = timer.iterations * timer.workDuration - timer.remainingTime;
            this.relaxedTime = timer.iterations > 1 ? (timer.iterations - 1) * timer.breakDuration : 0;
        }
        else {
            this.focusedTime = timer.iterations * timer.workDuration;
            this.relaxedTime = timer.iterations * timer.breakDuration - timer.remainingTime;
        }
    }

    static fromFirestore(data: any, id: string): Session {
        const session = new Session();
        session.iterationsNumber = data.iterationsNumber;
        session.beginDate = new Date(data.beginDate.seconds * 1000 + data.beginDate.nanoseconds / 1000000);
        session.endDate = new Date(data.endDate.seconds * 1000 + data.endDate.nanoseconds / 1000000);
        session.focusedTime = data.focusedTime;
        session.relaxedTime = data.relaxedTime;
        session.iterationsNumber = data.iterationsNumber;
        session.focusDuration = data.focusDuration;
        session.relaxDuration = data.relaxDuration;;
        session.id = id;

        return session;
    }

    private async initializeDurations() {
        const key = await getData("selectedDuration");
        const currentDuration = durations[parseInt(key!)];

        this.focusDuration = currentDuration.focusDuration;
        this.relaxDuration = currentDuration.relaxDuration;
    }
}