import {PlayerAnimationNames} from "./Animation";
import {GameScene} from "../Game/GameScene";
import {UserInputEvent, UserInputManager} from "../UserInput/UserInputManager";
import {Character} from "../Entity/Character";


export const hasMovedEventName = "hasMoved";
export interface CurrentGamerInterface extends Character{
    moveUser(delta: number) : void;
    say(text : string) : void;
}

export class Player extends Character implements CurrentGamerInterface {
    private previousDirection: string = PlayerAnimationNames.WalkDown;
    private wasMoving: boolean = false;

    constructor(
        Scene: GameScene,
        x: number,
        y: number,
        name: string,
        texturesPromise: Promise<string[]>,
        direction: string,
        moving: boolean,
        private userInputManager: UserInputManager
    ) {
        super(Scene, x, y, texturesPromise, name, direction, moving, 1);

        //the current player model should be push away by other players to prevent conflict
        this.getBody().setImmovable(false);
    }

    moveUser(delta: number): void {
        //if user client on shift, camera and player speed
        let direction = null;
        let moving = false;

        const activeEvents = this.userInputManager.getEventListForGameTick();
        const speedMultiplier = activeEvents.get(UserInputEvent.SpeedUp) ? 9 : 4;
        const moveAmount = speedMultiplier * 20;
        const moveAmountDiagonal = speedMultiplier * 14;

        let x = 0;
        let y = 0;
        if (activeEvents.get(UserInputEvent.MoveUp)) {
            y = -1;
            direction = PlayerAnimationNames.WalkUp;
            moving = true;
        } else if (activeEvents.get(UserInputEvent.MoveDown)) {
            y = 1;
            direction = PlayerAnimationNames.WalkDown;
            moving = true;
        }
        if (activeEvents.get(UserInputEvent.MoveLeft)) {
            x = -1;
            direction = PlayerAnimationNames.WalkLeft;
            moving = true;
        } else if (activeEvents.get(UserInputEvent.MoveRight)) {
            x = 1;
            direction = PlayerAnimationNames.WalkRight;
            moving = true;
        }
        if (x !== 0 && y !== 0) {
            x = x * moveAmountDiagonal;
            y = y * moveAmountDiagonal;
        } else {
            x = x * moveAmount;
            y = y * moveAmount;
        }
        if (x !== 0 || y !== 0) {
            this.move(x, y);
            this.emit(hasMovedEventName, {moving, direction, x: this.x, y: this.y});
        } else {
            if (this.wasMoving) {
                //direction = PlayerAnimationNames.None;
                this.stop();
                this.emit(hasMovedEventName, {moving, direction: this.previousDirection, x: this.x, y: this.y});
            }
        }

        if (direction !== null) {
            this.previousDirection = direction;
        }
        this.wasMoving = moving;
    }
}
