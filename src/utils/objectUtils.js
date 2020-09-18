function setToObjValue(sourceObj, targetObj) {
    Object.keys(targetObj).forEach(item1 => {
        Object.keys(sourceObj).every(item2 => {
            if (item1 === item2) {//属性名称相同
                targetObj[item1] = sourceObj[item2];
                return false;
            }

            return true;
        })
    })
}

function setObjValue(sourceObj, targetObj) {
    Object.keys(sourceObj).forEach(item1 => {
        if (sourceObj[item1] != null) {
            targetObj[item1] = sourceObj[item1];
        }
    })
}

export default {
    setToObjValue: function (sourceObj, targetObj) {
        return setToObjValue(sourceObj, targetObj);
    },
    /*setObjValue: function (sourceObj, targetObj) {
        return setObjValue(sourceObj, targetObj);
    },*/
}