export default {
  formatDate(date, format = "y-m-d h:i:s") {
    date = new Date(date);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    month = month > 9 ? month : `0${month}`;
    let day = date.getDate();
    let hours = date.getHours();
    hours = hours.length > 9 ? hours : `0${hours}`;
    let minutes = date.getMinutes();
    minutes = minutes > 9 ? minutes : `0${minutes}`;
    let seconds = date.getSeconds();
    seconds = seconds > 9 ? seconds : `0${seconds}`;
    format = format.replace(/y/, year);
    format = format.replace(/m/, month);
    format = format.replace(/d/, day);
    format = format.replace(/h/, hours);
    format = format.replace(/i/, minutes);
    format = format.replace(/s/, seconds);
    return format;
  },
  computedAge(brithday) {
    let brithdayDate = new Date(brithday);
    let brithdayYear = brithdayDate.getFullYear();
    let brithdayMonth = brithdayDate.getMonth() + 1;
    let brithdayDay = brithdayDate.getDate();
    let nowDate = new Date();
    let nowYear = nowDate.getFullYear();
    let nowMonth = nowDate.getMonth() + 1;
    let nowDay = nowDate.getDate();
    let age = nowYear - brithdayYear;
    if (nowMonth == brithdayMonth) {
      if (nowDay == brithdayDay || nowDay > brithdayDay) {
        return age;
      } else {
        return age - 1;
      }
    } else if (nowMonth > brithdayMonth) {
      return age;
    } else {
      return age - 1;
    }
  },
  computedOldAge(age, gender) {
    if (age == 9) {
      return "始龀";
    } else if (age == 10) {
      return "外傅";
    } else if (age == 13 && gender == "male") {
      return "舞勺";
    } else if (age > 12 && age < 15 && gender == "female") {
      return "豆蔻";
    } else if (age == 15 && gender == "female") {
      return "及笄";
    } else if (gender == "male" && age > 14 && age < 21) {
      return "及笄";
    } else if (gender == "male" && age == 20) {
      return "弱冠";
    } else if (age > 29 && age < 40) {
      return "而立";
    } else if (age > 39 && age < 50) {
      return "不惑";
    } else if (age > 49 && age < 60) {
      return "知命";
    } else if (age > 59 && age < 70) {
      return "花甲";
    } else if (age == 70) {
      return "古稀";
    } else if (age > 70 && age < 91) {
      return "耄耋";
    } else if (age > 90) {
      return "黄发";
    } else {
      return "";
    }
  },
  async uploadFile(files, savePath = "temp/") {
    if (files instanceof Array) {
      let fileId = [];
      for (let i = 0; i < files.length; i++) {
        let fileName = `${Math.round(
          Math.random() * 100000000
        )}${Date.now()}`;
        let fileExtension = files[i].slice(files[i].lastIndexOf("."));
        let filePath = fileName + fileExtension;
        let cloudPath = savePath + filePath;
        await wx.cloud
          .uploadFile({
            cloudPath,
            filePath:  files[i],
          })
          .then((res) => {
            fileId.push(res.fileID);
          });
      }
      return fileId;
    } else {
      let fileId = "";
      let fileName = `${Math.round(Math.random() * 100000000)}${Date.now()}`;
      let fileExtension = files.slice(files.lastIndexOf("."));
      let filePath = fileName + fileExtension;
      let cloudPath = savePath + filePath;
      await wx.cloud
        .uploadFile({
          cloudPath,
          filePath: files,
        })
        .then((res) => {
          fileId = res.fileID;
        });
      return fileId;
    }
  },
  getType(value){
    let type=Object.prototype.toString.call(value);
    return type.slice(type.lastIndexOf(" ")+1,type.indexOf("]"));
  }
};
