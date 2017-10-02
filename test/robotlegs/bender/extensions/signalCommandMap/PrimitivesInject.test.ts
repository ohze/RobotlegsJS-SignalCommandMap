import "../../../../entry";

import { assert } from "chai";
import { ISignal, Signal } from "@robotlegsjs/signals";
import { Context, ICommand } from "@robotlegsjs/core";
import { SignalCommandMapExtension } from "../../../../../src/robotlegs/bender/extensions/signalCommandMap/SignalCommandMapExtension";
import { ISignalCommandMap } from "../../../../../src/robotlegs/bender/extensions/signalCommandMap/api/ISignalCommandMap";
import { injectable, inject } from "inversify";

class PrimitiveSignal extends Signal {
    constructor() {
        super(Boolean, Number, Object, String);
    }
}

@injectable()
class PrimitiveCommand implements ICommand {
    static B: boolean;
    static N: number;
    static O: object;
    static S: string;

    @inject(Boolean) private b: boolean;
    @inject(Number) private n: number;
    @inject(Object) private o: object;
    @inject(String) private s: string;

    public execute(): void {
        PrimitiveCommand.B = this.b;
        PrimitiveCommand.N = this.n;
        PrimitiveCommand.O = this.o;
        PrimitiveCommand.S = this.s;
    }
}

describe("PrimitivesInjectTest", () => {
    let signal: ISignal;
    let context: Context;

    beforeEach(() => {
        signal = new Signal(Number, Boolean);
        context = new Context();
    });

    it("dispatch_primitive_types", () => {
        signal.addOnce((n: number, b: boolean) => {
            assert.equal(n, 3);
            assert.equal(b, true);
        });
        signal.dispatch(3, true);
    });

    it("inject_primitive_to_commands", () => {
        context.install(SignalCommandMapExtension);
        context.initialize();
        let instance: ISignalCommandMap = context.injector.get<
            ISignalCommandMap
        >(ISignalCommandMap);

        instance.map(PrimitiveSignal).toCommand(PrimitiveCommand);
        const o = {
            foo: "baz",
            x: 19,
            b: false
        };
        const s = "the string";
        context.injector
            .get<PrimitiveSignal>(PrimitiveSignal)
            .dispatch(true, 5, o, s);
        assert.equal(PrimitiveCommand.B, true);
        assert.equal(PrimitiveCommand.N, 5);
        assert.deepEqual(PrimitiveCommand.O, o);
        assert.notDeepEqual(PrimitiveCommand.O, { ...o, v: 5 });
        assert.equal(PrimitiveCommand.S, s);
    });
});
