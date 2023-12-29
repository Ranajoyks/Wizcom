export default class BaseState<U>
{
    Model:U;
    pressed:boolean;
    constructor(Model:U)
    {
        this.Model=Model;
        this.pressed=false;
    }
}