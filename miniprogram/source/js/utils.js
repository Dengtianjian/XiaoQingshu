export default {
  formatDate(date,format="y-m-d h:i:s"){
    date=new Date(date);
    let year=date.getFullYear();
    let month=date.getMonth()+1;
    month=month>9?month:`0${month}`;
    let day=date.getDate();
    let hours=date.getHours();
    hours=hours.length>9?hours:`0${hours}`;
    let minutes=date.getMinutes();
    minutes=minutes>9?minutes:`0${minutes}`;
    let seconds=date.getSeconds();
    seconds=seconds>9?seconds:`0${seconds}`;
    format=format.replace(/y/,year);
    format=format.replace(/m/,month);
    format=format.replace(/d/,day);
    format=format.replace(/h/,hours);
    format=format.replace(/i/,minutes);
    format=format.replace(/s/,seconds);
    return format;
  },
  computedAge(brithday){
    let brithdayDate=new Date(brithday);
    let brithdayYear=brithdayDate.getFullYear();
    let brithdayMonth=brithdayDate.getMonth()+1;
    let brithdayDay=brithdayDate.getDate();
    let nowDate=new Date();
    let nowYear=nowDate.getFullYear();
    let nowMonth=nowDate.getMonth()+1;
    let nowDay=nowDate.getDate();
    let age=nowYear-brithdayYear;
    if(nowMonth==brithdayMonth){
      if(nowDay==brithdayDay||nowDay>brithdayDay){
        return age;
      }else{
        return age-1;
      }
    }else if(nowMonth>brithdayMonth){
      return age;
    }else{
      return age-1;
    }
  }
}