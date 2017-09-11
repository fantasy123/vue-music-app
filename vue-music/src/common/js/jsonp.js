import originJSONP from 'jsonp' // 第三方库

export default function jsonp(url, data, option) {  // 库需要手动拼url 二次封装屏蔽拼接过程 取而代之的是传入一个对象data
  url += (url.indexOf('?')<0 ? '?':'&') + param(data);  // 没有问号要拼一个问号 param(data)的第一个&要去掉 不然多一个

  return new Promise((resolve, reject) => {
    originJSONP(url, opt, (err, data) => {
      if (!err) {
        resolve(data);
      } else {
        reject(err);
      }
    })
  });
}

function param(data) {  // 这个不用暴露 内部使用
  let url = '';

  for (let k in data) {
    let value = data[k] !== undefined ? data[k] : '';
    url += `&${k}=${encodeURIComponent(value)}`;
  }

  return url ? url.substr(1) : '';
}
