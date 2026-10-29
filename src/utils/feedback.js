function request(options) {
  return new Promise(resolve => {
    const event=new CustomEvent('workspace-feedback',{cancelable:true,detail:{...options,resolve}});
    if(window.dispatchEvent(event))resolve(false); // Fail closed until the application host is mounted.
  });
}
export const confirmAction = options => request(typeof options==='string'?{message:options,kind:'confirm'}:{...options,kind:'confirm'});
export const notifyUser = message => request({kind:'notice',title:'Action could not be completed',message:String(message),variant:'danger'});

export const showNotice = options => request({...options,kind:'notice'});
