let getFloatDecimalPortion = function(x) {
    x = Math.abs(parseFloat(x));
    let n = parseInt(x);
    return (parseInt(parseFloat((Number((x - n).toFixed(Math.abs((""+x).length - (""+n).length - 1))) * 60 / 100).toFixed(2)) * 100)).toString().padStart(3, "0");
}

let getHoraireToString = function (x) {
    var heure = parseInt(x[0]).toString();
    var minute = getFloatDecimalPortion(x[1]).toString();
    return heure+" h "+minute;

}