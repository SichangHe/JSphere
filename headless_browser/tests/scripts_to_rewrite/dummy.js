(function () {
    function aa(a) {
        var b =
            a +
            "                                                                                                                                                                                                                                                                                                                                                                                                                "
        return b
    }
    function bb(a) {
        var b =
            a +
            "                                                                                                                                                                                                                                                                                                                                                                                                                "
        return b
    }
    function cc(a) {
        var aa = function (a) {
            return (
                a +
                "                                                                                                                                                                                                                                                                                                                                                                                                                "
            )
        }
        var b =
            aa(a) +
            "                                                                                                                                                                                                                                                                                                                                                                                                                "
        var c =
            b +
            "                                                                                                                                                                                                                                                                                                                                                                                                                "
        var d =
            c +
            "                                                                                                                                                                                                                                                                                                                                                                                                                "
        return d
    }
    var a =
        "                                                                                                                                                                                                                                                                                                                                                                                                                "
    var b = aa(a)
    var c = bb(b)
    var d = cc(c)
    return d
}).call(this)
