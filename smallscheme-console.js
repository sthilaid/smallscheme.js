
var env=false
canvas = document.getElementById("ConsoleCanvas")
if (canvas)
{
    context = canvas.getContext("2d")

    env=smallSchemeEnv()
    consoleInstance = new Console(canvas, context, function(cmd){
        if (cmd == "") return " "
        try {
            let exp     = smallSchemeParse(cmd)
            let cpsExp  = exp.toCPS(primordialK())
            let val     = smallSchemeEvalAST(cpsExp, env)
            return val.pprint()
        } catch (err) {
            if (err.name == "SmallSchemeError") {
                let msg = "*ERROR* "+err.message
                console.log(msg)
                return msg
            }
            else
                throw err
        }
    })
    consoleInstance.bannerMessage = "SmallScheme REPL"
    consoleInstance.refresh()
    window.requestAnimationFrame(function(step){consoleInstance.step(step)})
}
