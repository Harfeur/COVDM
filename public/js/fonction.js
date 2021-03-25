let getFloatDecimalPortion = function(x) {
    x = Math.abs(parseFloat(x));
    let n = parseInt(x);
    return (parseInt(parseFloat((Number((x - n).toFixed(Math.abs((""+x).length - (""+n).length - 1)))).toFixed(2)) * 100)).toString().padStart(2, "0");
}

let getHoraireToString = function (x) {
    var heure = parseInt(x).toString();
    var minute = getFloatDecimalPortion(x).toString();
    return heure+"h"+minute;

}