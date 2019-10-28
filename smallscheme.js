const SchemeToken = {
    id          : 0,
    bool        : 1,
    num         : 2,
    character   : 3,
    string      : 4,
    lparen      : 5,
    rparen      : 6,
    lvec        : 7,
    quote       : 9,
    backquote   : 10,
    comma       : 11,
    splice      : 12,
    dot         : 13,
}

class SmallScheme {
    static parse_whitespace(input) {
        if (input.length == 0)                      return false
        if (input[0] == " " || input[0] == "\t")    return input.substr(1)
        else                                        return false
    }
    static parse_comment(input) {
        if (input.length == 0)  return false
        if (input[0] != ";")    return false
        let i=0
        for (i=0; i<input.length; ++i) {
            if (input[i] == "\n")
                break
        }
        return input.substr(i+1)
    }
    static parse_atmosphere(input) {
        let out = false
        if (out = SmallScheme.parse_whitespace(input))  return out
        if (out = SmallScheme.parse_comment(input))     return out
        else                                            return false
    }
    static tokenize(input) {
        
    }
}
