
canvas = document.getElementById("ConsoleCanvas")
if (canvas)
{
    context = canvas.getContext("2d")

    var env=smallSchemeEnv()
    consoleInstance = new Console(canvas, context, function(cmd){
        if (cmd == "") return " "
        try {
            let exp     = smallSchemeParse(cmd)
            let cpsExp  = exp.toCPS(primordialK())
            let val     = smallSchemeEvalAST(cpsExp, env)
            return val.pprint()
        } catch (err) {
            if (err.name == "SmallSchemeError")
                return "*ERROR* "+err.message
            else
                throw err
        }
    })
    consoleInstance.bannerMessage = "SmallScheme REPL"
    consoleInstance.refresh()
    window.requestAnimationFrame(function(step){consoleInstance.step(step)})
}
