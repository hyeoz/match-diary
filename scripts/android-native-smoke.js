// Alternate Metro entry for local release/R8 QA only. Never upload this bundle.
import React, { useEffect } from 'react';
import { AppRegistry, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import RNFS from 'react-native-fs2';
import SQLite from 'react-native-sqlite-storage';
import { AdsConsent } from 'react-native-google-mobile-ads';
import notifee from '@notifee/react-native';

const assert = (condition, label) => {
  if (!condition) throw new Error(label);
};

async function checkNativeModules() {
  const key = 'MATCHDIARY_RELEASE_NATIVE_QA';
  const file = `${RNFS.CachesDirectoryPath}/matchdiary-release-native-qa.txt`;
  const database = 'matchdiary-release-native-qa.db';
  const value = 'synthetic QA data';
  try {
    for (const storage of [Keychain.STORAGE_TYPE.AES_CBC, Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH]) {
      await Keychain.setGenericPassword('qa', value, { service: key, storage });
      const stored = await Keychain.getGenericPassword({ service: key });
      assert(stored && stored.password === value, 'Keychain read/write');
      await Keychain.resetGenericPassword({ service: key });
      assert(!(await Keychain.getGenericPassword({ service: key })), 'Keychain deletion');
    }
    console.info('MATCHDIARY_NATIVE_QA: keychain CBC/GCM/read/delete PASS');
    await AsyncStorage.setItem(key, value);
    assert(await AsyncStorage.getItem(key) === value, 'AsyncStorage read/write');
    console.info('MATCHDIARY_NATIVE_QA: async storage PASS');
    await RNFS.writeFile(file, value, 'utf8');
    assert(await RNFS.readFile(file, 'utf8') === value, 'Filesystem read/write');
    console.info('MATCHDIARY_NATIVE_QA: filesystem PASS');
    SQLite.enablePromise(true);
    let db = await SQLite.openDatabase({ name: database, location: 'default' });
    await db.executeSql('CREATE TABLE IF NOT EXISTS qa (value TEXT)');
    await db.executeSql('DELETE FROM qa');
    await db.executeSql('INSERT INTO qa VALUES (?)', [value]);
    await db.close();
    db = await SQLite.openDatabase({ name: database, location: 'default' });
    const [rows] = await db.executeSql('SELECT value FROM qa');
    assert(rows.rows.item(0).value === value, 'SQLite persistence');
    await db.close();
    await SQLite.deleteDatabase({ name: database, location: 'default' });
    console.info('MATCHDIARY_NATIVE_QA: sqlite persistence PASS');
    await AdsConsent.getConsentInfo(); // No ad requests or consent dialog.
    await notifee.getNotificationSettings(); // No permission request.
    console.info('MATCHDIARY_NATIVE_QA: consent/notifications bridge PASS');
    console.info('MATCHDIARY_NATIVE_QA: ALL PASS');
  } catch (error) {
    console.error('MATCHDIARY_NATIVE_QA: FAIL', String(error));
  } finally {
    await AsyncStorage.removeItem(key);
    if (await RNFS.exists(file)) await RNFS.unlink(file);
    await Keychain.resetGenericPassword({ service: key });
  }
}

function NativeSmoke() {
  useEffect(() => { checkNativeModules(); }, []);
  return React.createElement(Text, null, 'Local native release checks');
}

AppRegistry.registerComponent('matchdiary', () => NativeSmoke);
