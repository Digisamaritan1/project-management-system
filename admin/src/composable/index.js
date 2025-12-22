export function useCustomComposable() {

    function setTitle({title = "", prefix = ""}) {
        document.title = prefix + title;
    }

    function makeUniqueId(length = 6) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * 
            charactersLength));
        }
        return result;
    }

    function addZero(val) {
        return val > 9 ? val : "0"+val;
    }

    function compareObjects(object1, object2, key) {
        const obj1 = object1[key];
        const obj2 = object2[key];
        if (obj1 < obj2) {
          return -1
        }
        if (obj1 > obj2) {
          return 1
        }
        return 0
    }

    function debounce(func, timeout = 300) {
        let timer = null;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(null, args); }, timeout);
        };
    }

    return {
        setTitle,
        makeUniqueId,
        compareObjects,
        addZero,
        debounce
    }
}