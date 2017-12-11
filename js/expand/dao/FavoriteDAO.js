import React, { Component } from 'react'
import {
  AsyncStorage,
  DeviceEventEmitter
} from 'react-native'
import keys from '../../../res/data/keys.json'
import langs from '../../../res/data/langs.json'
import UserDao from './UserDao'

const base64 = require('base-64')
const url_star = 'https://api.github.com/user/starred/'
const url_page = 'https://api.github.com/user/starred?page='

export default class FavoriteDAO {
  constructor () {
    this.userDao = new UserDao()
    this.favoriteKey = 'favorite'
    // reload the remote starred repos when the app start
    this.reloadStarredRepos()
  }

  // fetch all user's starred repo and update
  reloadStarredRepos () {
    // if no user logged in, pass
    this.userDao.loadCurrentUser()
      .then(() => {
        // fetch remote starred repos
        this.userDao.fetchStarredRepos()
          .then(responses => {
            let values = []
            let ids = []
            for (let i = 0, len = responses.length; i < len; i++) {
              let repos = JSON.parse(responses[i]._bodyText)
              for (let j = 0; j < repos.length; j++) {
                ids.push(repos[j].id.toString())
                values.push(JSON.stringify(repos[j]))
              }
            }

            // set this.favoriteKey in AsyncStorage
            AsyncStorage.setItem(this.favoriteKey, JSON.stringify(ids),
              (error) => {
                if (!error) {
                  let zip = ids.map(function (e, i) {
                    return [e, values[i]]
                  })
                  // set zipped ids and values in AsyncStorage
                  AsyncStorage.multiSet(zip, (error) => {
                    if (!error) {
                      // get all keys stored in AsyncStorage
                      AsyncStorage.getAllKeys((error, keys) => {
                        if (!error) {
                          for (let i = 0; i < keys.length; i++) {
                            let key = keys[i]
                            // delete the key if the key represents id number
                            if (!isNaN(key)) {
                              if (!ids.includes(key)) {
                                AsyncStorage.removeItem(key)
                              }
                            }
                          }
                        }
                      })
                    }
                  })
                }
              })
          })
      })
      .catch(error => {
        console.log(error)
        console.log('Please login!')
      })
  }

  /**
   * Save Favorite item
   * @param key: project id or name
   * @param value: favorite item
   * @param callback
   */
  saveFavoriteItem (key, value, callback) {
    AsyncStorage.setItem(key, value, (error) => {
      if (!error) {
        this.updateFavoriteKeys(key, true)
      }
    })
    let item = JSON.parse(value)
    this.userDao.starRepo(item.full_name)
  }

  /**
   * Update favorite key sets
   * @param key
   * @param isAdd true: add, false: delete
   */
  updateFavoriteKeys (key, isAdd) {
    AsyncStorage.getItem(this.favoriteKey, (error, result) => {
      if (!error) {
        let favoriteKeys = []
        if (result) {
          favoriteKeys = JSON.parse(result)
        }
        let index = favoriteKeys.indexOf(key)
        if (isAdd && index === -1) {
          favoriteKeys.push(key)
        } else if (!isAdd && index !== -1) {
          favoriteKeys.splice(index, 1)
        }
        AsyncStorage.setItem(this.favoriteKey, JSON.stringify(favoriteKeys))
      }
    })
  }

  /**
   * Gain favroite items' key
   * @returns {Promise<any>}
   */

  getFavoriteKeys () {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem(this.favoriteKey, (error, result) => {
        if (!error) {
          try {
            resolve(JSON.parse(result))
          } catch (e) {
            reject(e)
          }
        } else {
          reject(error)
        }
      })
    })
  }

  /**
   * remove saved favorite item
   * @param key
   */
  removeFavoriteItem (key, value) {
    AsyncStorage.removeItem(key, (error) => {
      if (!error) {
        this.updateFavoriteKeys(key, false)
      }
    })
    let item = JSON.parse(value)
    this.userDao.unstarRepo(item.full_name)
  }
}