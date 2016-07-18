var vfiConstants = {
    keyUserId: 'vfi-user-id'
};

var sessionStorageHelper = {
  getPair: function(key) {
    return JSON.parse(sessionStorage.getItem(key));
  },
  setPair: function(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  },
  removePair: function(key) {
    sessionStorage.removeItem(key);
  }
};
