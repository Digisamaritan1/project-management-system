export const getConvertedTimeString = (n,type) =>{
    try{
        var num = n;
        var hours = (num / 60);
        var rhours = Math.floor(hours);
        var minutes = (hours - rhours) * 60;
        var rminutes = Math.round(minutes);
        if (type == 'update') {
            if(rhours > 0 || rminutes > 0 || (rhours > 0 && rminutes > 0)){
                // return rhours.toString().padStart(2, '0') + ':' + rminutes.toString().padStart(2, '0');
                return (rhours >= 0 && rhours <= 9 ? "0"+rhours : rhours) + ':' + ((rminutes >= 0 && rminutes <= 9) ? "0"+ rminutes : rminutes);
            }else{
                return ''
            }
        } else if (type == 'fetch') {
            return rhours.toString().padStart(2, '0') + 'h' + ' ' + rminutes.toString().padStart(2, '0') + 'm';
        } else if (type == 'onSelectItem') {
            if (rminutes < 60) {
                return rminutes.toString() + 'm';
            } else if (rminutes == 60) {
                return rhours.toString() + 'h';
            } else if (rminutes > 60) {
                return rhours.toString() + 'h' + ' ' + rminutes.toString() + 'm';
            }
        }
        if (type == 'estimatedSuggestion') {
            let array = [];
            array.push(rhours.toString().padStart(2, '0') + 'hour' + ' ' + rminutes.toString().padStart(2, '0') + 'minute');
            return array
        }
    }
    catch(error){
        console.error(error);
    }
}

export const totalDateRowLog = (colName,array,key) =>{
    let finalTotal = 0;
    try{
        let idArray = [];
        let tempObj = colName[key] ? colName[key] : null;
        if(array.length > 0){
            array.map((val)=>{
                if(Object.keys(tempObj).length){
                    if(Object.keys(tempObj).includes(val.id)){
                       finalTotal += tempObj[`${val.id}`]
                    }
                }
                idArray.push(val.id)
            })
        }
        return finalTotal;
    }
    catch(error){
        console.error(error);
        return finalTotal;
    }
}


export const totalDateProjectRowLog = (colName,array, key) =>{
    let finalTotal = 0;
    try{
        let idArray = [];
        let tempObj = colName[key] ? colName[key] : null;
        if(array.length > 0){
            array.map((val)=>{
                if(Object.keys(tempObj).length){
                    if(Object.keys(tempObj).includes(val.id)){
                       finalTotal += tempObj[`${val.id}`]
                    }
                }
                idArray.push(val.id)
            })
        }
        return finalTotal;
    }
    catch(error){
        console.error(error);
        return finalTotal;
    }
}

export const companyPrioritiesIcons = (key) => {

    let data = [
        {
            value: "HIGH",
            statusImage: require("@/assets/images/png/priority_high.png")
        },
        {
            value: "MEDIUM",
            statusImage: require("@/assets/images/png/priority_medium.png")
        },
        {
            value: "LOW",
            statusImage: require("@/assets/images/png/priority_low.png")
        }
    ];

    const result = data.filter(x => x.value === key);
    return result[0];
}
