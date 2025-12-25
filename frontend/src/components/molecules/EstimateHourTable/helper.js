import { useMoment } from "@/composable";

const { changeDateFormate, getMoment } = useMoment();

//Convert minutes to hours
export const timeConvert = (min) => {
    var hours = Math.floor(min / 60);
    var minutes = Math.round(min % 60);
    return hours.toString().padStart(2, '0')+'h'+' '+ minutes.toString().padStart(2, '0')+'m';
};

//Get month short name
export const  getMonthName = (monthNumber) =>{
    const date = new Date();
    date.setMonth(monthNumber);
  
    return date.toLocaleString('en-US', {
      month: 'short',
    });
}

//Get Months between two dates
export const getMonths = (fromDate, toDate) => {
    return new Promise((resolve, reject) => {
        try{
            let tempM = [];
            const fromYear = fromDate.getFullYear();
            const fromMonth = fromDate.getMonth();
            const toYear = toDate.getFullYear();
            const toMonth = toDate.getMonth();
            for(let year = fromYear; year <= toYear; year++) {
                let monthNum = year === fromYear ? fromMonth : 0;
                const monthLimit = year === toYear ? toMonth : 11;
                for(; monthNum <= monthLimit; monthNum++) {
                    let month = monthNum;
                    let monthName = getMonthName(monthNum);
                    let calenderMonth = monthName;
                    if(fromYear !== toYear) {
                        monthName += ` ${year}`;
                    }
                    tempM.push({year, month, monthName, calenderMonth});
                }
            }
            resolve(tempM);
        }catch(error){
            reject(error);
        }
    })
};

//Get the day number of day before the date
export const getPreviousDay = (date,number) => {
    let final = [];
    let finalCount = 6 - number;
    for(let i = 1; i <= finalCount; i+=1){
        const previous = new Date(date.getTime());
        previous.setDate(date.getDate() - i);
        final.push({
            'date': previous,
            'day': changeDateFormate(previous, 'DD'),
            'dayName': changeDateFormate(previous, 'ddd'),
            'isFiltered':false
        });
    }
    return final;
}

//Get the day number of day after the date
export const getNextDay = (date,number) => {
    let final = [];
    for(let i = 1; i <= number; i+=1){
        const previous = new Date(date.getTime());
        previous.setDate(date.getDate() + i);
        final.push({
            'date': previous,
            'day': changeDateFormate(previous,'DD'),
            'dayName': changeDateFormate(previous,'ddd'),
            'isFiltered':false
        });
    }
    return final;
}

export const getfinalWeekendDays = (start, end, dateFormat) => {
    return new Promise((resolve, reject) => {
        try{
            let weekEndDays = 0;
            let storedWeek = [];
            for(var arr=[],dt=start; dt<=end; dt.setDate(dt.getDate()+1)){
                let first = getMoment(new Date(dt));
                let nthOfMoth = Math.ceil(first.date() / 7);
                let isValid = true;
                let getWeekKeys = storedWeek.findIndex((x)=>{return x == nthOfMoth})
                if(getWeekKeys <= -1){
                    let getLastKey = arr.length > 0 ? parseInt( arr.length - 1 ) : -1;
                    if(getLastKey != -1){
                        if(arr[getLastKey] && arr[getLastKey].date.length != 7){
                            arr[getLastKey].date.push({
                                'date': new Date(dt),
                                'day': changeDateFormate(new Date(dt),'DD'),
                                'dayName': changeDateFormate(new Date(dt),'ddd'),
                                'localFormated': changeDateFormate(new Date(dt), dateFormat),
                                'isFiltered':true
                            }); 
                            isValid = false;
                        }else{
                            storedWeek.push(nthOfMoth);
                        }
                    }else{
                        storedWeek.push(nthOfMoth);
                    }
                }
                if(isValid==true){
                    let findInd = arr.findIndex((x)=>{return x.weekNo == nthOfMoth});
                    if(findInd > -1){
                        if(7 > parseInt(arr[findInd].date.length)){
                            arr[findInd].date.push({
                                'date': new Date(dt),
                                'day': changeDateFormate(new Date(dt),'DD'),
                                'dayName': changeDateFormate(new Date(dt),'ddd'),
                                'localFormated': changeDateFormate(new Date(dt), dateFormat),
                                'isFiltered':true
                            });
                            arr[findInd].remainDays = 6 - new Date(dt).getDay();
                        }else{
                            weekEndDays = 6 - new Date(dt).getDay(); 
                            let nextWeek = Number(nthOfMoth) + 1;
                            let fnext = arr.findIndex((x)=>{return x.weekNo == nextWeek});
                            if(fnext <= -1){
                                let getpreviouse = [];
                                let tempDate = [{
                                    'date': new Date(dt),
                                    'day':changeDateFormate(new Date(dt), 'DD'),
                                    'dayName':changeDateFormate(new Date(dt), 'ddd'),
                                    'localFormated': changeDateFormate(new Date(dt), dateFormat),
                                    'isFiltered':true
                                }];
                                if(weekEndDays < 6 && new Date(dt).getDay() != 0){
                                    getpreviouse = getPreviousDay(new Date(dt),weekEndDays);
                                    if(getpreviouse != undefined && getpreviouse != null){
                                        Array.prototype.push.apply(tempDate,getpreviouse);
                                        tempDate.sort(function(a, b){ return a.date - b.date });
                                }
                                weekEndDays = 6 - tempDate[0].date.getDay();
                                }
                                arr.push({
                                    'date':tempDate,
                                    'weekNo':nextWeek,
                                    'weekName':`Week${nextWeek}`,
                                    'remainDays':weekEndDays,
                                    'isFiltered':true
                                });
                            }else{
                                arr[fnext].date.push({
                                    'date': new Date(dt),
                                    'day': changeDateFormate(new Date(dt), 'DD'),
                                    'dayName':changeDateFormate(new Date(dt), 'ddd'),
                                    'localFormated': changeDateFormate(new Date(dt), dateFormat),
                                    'isFiltered':true
                                });
                                arr[fnext].remainDays = 6 - new Date(dt).getDay();
                            }
                        }
                    }else{
                        weekEndDays = 6 - new Date(dt).getDay();
                        let tempDate = [{
                                'date': new Date(dt),
                                'day': changeDateFormate(new Date(dt), 'DD'),
                                'dayName': changeDateFormate(new Date(dt), 'ddd'),
                                'localFormated': changeDateFormate(new Date(dt), dateFormat),
                                'isFiltered': true
                        }];
                        if(weekEndDays < 6 && new Date(dt).getDay() != 0){
                                let getpreviouse = getPreviousDay(new Date(dt),weekEndDays);
                                if(getpreviouse != undefined && getpreviouse != null){
                                    Array.prototype.push.apply(tempDate,getpreviouse);
                                    tempDate.sort(function(a, b){ return a.date - b.date });
                                    weekEndDays = 6 - tempDate[0].date.getDay();
                                }
                        }
                        arr.push({
                            'date':tempDate,
                            'weekNo':nthOfMoth,
                            'weekName':`Week${nthOfMoth}`,
                            'remainDays':weekEndDays,
                            'isFiltered':true
                        });
                    }
                }
                let current = changeDateFormate(new Date(dt), 'YYYY-MM-DD');
                let last = changeDateFormate(end, 'YYYY-MM-DD');
                var bool2 = getMoment(current).isSameOrAfter(last);
                if(bool2==true){
                    let lastInd = arr.length != 0 ? Number(arr.length) - 1 : 0;
                    if(arr[lastInd].date.length && arr[lastInd].date.length != 7){
                        let fetchNext = 7 - arr[lastInd].date.length;
                        let getNextDays = getNextDay(new Date(dt),fetchNext);
                        if(getNextDays && getNextDays != null){
                            Array.prototype.push.apply(arr[lastInd].date,getNextDays);
                            arr[lastInd].date.sort(function(a, b){ return a.date - b.date });
                        }
                    }
                    resolve(arr);
                    break;
                }
            }
        }catch(error){
            reject(error);
        }
    })
}