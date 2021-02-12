const SETTINGS_STORAGE_KEY = 'settings';
const TO_PLAY_STORAGE_KEY = 'toPlay';
const NICK_SETTING_KEY = 'nick';
const PASSWORD_SETTING_KEY = 'password';
const INTERVAL_SETTING_KEY = 'interval';
const LOGIN_PAGE = 'https://farmersi.pl/';

chrome.runtime.onInstalled.addListener(async () => {
  const settings = await getItemFromStorage(SETTINGS_STORAGE_KEY);

  if (settings) {
    const user = getSettingByKey(settings, NICK_SETTING_KEY);
    const password = getSettingByKey(settings, PASSWORD_SETTING_KEY);
    const interval = parseInt(getSettingByKey(settings, INTERVAL_SETTING_KEY)) * 60 * 1000;

    if (user && password && interval) {
      handleNotificationClick();
      checkGames(settings);
      setInterval(() => {
        checkGames(settings);
      }, interval);
    } else {
      console.warn('Insufficient settings. Username, password and interval needed.')
    }
  } else {
    console.warn('There is nothing we can do. No user settings available.');
  }
});

const checkGames = (settings) => {
  const postData = getLoginBody(settings);

  fetch(LOGIN_PAGE, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
    },
    body: postData,
  }).then(res => res.text()).then(async response => {
    const html = document.createElement('html');
    html.innerHTML = response;

    const games = html.querySelectorAll(".dwa a[href*='user.php?id_gra']");
    const actionNeededGames = [];
    
    if (games) {
        games.forEach(game => {
            if (
                game.nextElementSibling 
                && game.nextElementSibling.nextElementSibling 
                && game.nextElementSibling.nextElementSibling.textContent === 'podejmij decyzje'
            ) {
                actionNeededGames.push(game.textContent);
            }
        })
    }

    let toPlay = await getItemFromStorage(TO_PLAY_STORAGE_KEY) || [];

    const gameCount = actionNeededGames.length;
    const newGamesToPlay = actionNeededGames.filter(game => !toPlay.includes(game));

    chrome.storage.sync.set({[TO_PLAY_STORAGE_KEY]: actionNeededGames}, function() {
      console.log('Games to play saved in the store', actionNeededGames);
    });

    if (newGamesToPlay.length) {
      sendNotification(`Gry (${gameCount}) oczekują na podjęcie decyzji!`);
    }
  });
};

const getLoginBody = (settings) => {
  const bodyValues = {
    login: getSettingByKey(settings, NICK_SETTING_KEY),
    password: getSettingByKey(settings, PASSWORD_SETTING_KEY),
    logowanie: 'zaloguj',
  };
  const formData = new FormData();

  for (param in bodyValues) formData.append(param, bodyValues[param]);

  return new URLSearchParams(formData).toString();
};

const getItemFromStorage = key => {
  return new Promise(result => {
    chrome.storage.sync.get(key, res => result(res[key]));
  });
};

const sendNotification = message => {
  const id = 'farmersi_notifier_' + Date.now();

  chrome.notifications.create(id, {
    title: 'Farmersi Notifier',
    iconUrl: '/images/get_started16.png',
    type: 'basic',
    message,
  }, () => {
    console.log('Notification was send');
  });
};

const handleNotificationClick = () => {
  chrome.notifications.onClicked.addListener(notificationId => {
    chrome.tabs.create({url: LOGIN_PAGE});
  });
};

const getSettingByKey = (settings, key) => {
  let value = null;

  try {
    value = settings.find(item => item.key === key).value;
  } catch (e) {
    console.error(`Setting ${key} could not be read from settings`, e);
  }

  return value;
};
