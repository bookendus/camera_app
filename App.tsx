import React, { useState, useEffect } from 'react';
import { StyleSheet ,Text, View, TouchableOpacity, Image, Platform} from 'react-native';
import { Camera } from 'expo-camera';
import axios from 'axios';
import FormData  from 'form-data'

export default function App() {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [image, setImage] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [imageCount, setImageCount] = useState(0);
  const [sess, setSess] = React.useState(null)

useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync()
      if (cameraStatus.status === 'granted') {
        setHasCameraPermission(true)
        const newLocal = (+new Date).toString(36).slice(-8)
        setSess(newLocal)
      }
    })()
  }, [])
useEffect(() => {
    (async () => {
    __sendImage()
    })()
  }, [image] )

  // useEffect(() => {
  //   __sendImage()
  // },[image])

const __takePicture = async () => {
    if(camera){
        const data = await camera.takePictureAsync(null)
        setImage(data.uri)
        setImageCount(cnt => cnt + 1)
    }
  }

  const __sendImage = async() => {
    
    if(!image) return

    const file =  Platform.OS === 'ios' ? image : DataURIToBlob(image)
    const ext = Platform.OS === 'ios'? '.jpg' : '.png'
    const fileName = sess + '/' + '00000' + imageCount + ext

    const formData = new FormData()
    if (Platform.OS === 'ios') {
      formData.append('upload_file', {
        uri: image,
        type: 'image/jpg',
        name: fileName
      })
    } else {
      formData.append('upload_file', file, fileName)
    }


    return axios.post("http://192.168.0.12:5000/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      } }
    ).then(res => {
      console.log('send file :'+ fileName )
    }).catch(err => {
      alert('Error: ')
    })
  }


  if (hasCameraPermission === false) {
    return <Text>No access to camera</Text>
  }
  return (
   <View style={styles.viewContainer}>
      <View style={styles.header} />
      <View style={styles.contents} >
      <View style={styles.cameraContainer}>
            <Camera 
            ref={ref => setCamera(ref)}
            style={styles.cameraView} 
            type={type}
            ratio={'1:1'} />
      </View>
      <View style={styles.panelContainer} >
        <View style={styles.panelView} >
          <Text style={styles.countText} >
            {'00000' + imageCount}
          </Text>
          <TouchableOpacity style={styles.captureButton}
                            onPress={() => __takePicture()} />
          <TouchableOpacity style={styles.flipButton}
                onPress={() => {
                  setType(
                    type === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back
                  )
                }}><Text>Flip Camera</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.preView} >
            {image && <Image source={{uri: image}} style={{flex:1}}/>}
        </View>
      </View>
      </View>
      <View style={styles.footer} />

   </View>
  )
}

function DataURIToBlob(dataURI: string) {
  const splitDataURI = dataURI.split(',')
  const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1])
  const mimeString = splitDataURI[0].split(':')[1].split(';')[0]

  const ia = new Uint8Array(byteString.length)
  for (let i = 0; i < byteString.length; i++)
      ia[i] = byteString.charCodeAt(i)

  return new Blob([ia], { type: mimeString })
}

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    backgroundColor: 'white'
  },
  header: {
    height: 40,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'white',
  },
  footer: {
    height: 35,
    backgroundColor: 'white'
  },
  cameraContainer: {
      flex: 1,
      backgroundColor: 'white',
      alignItems: 'center',
      width: '80%',
  },
  cameraView:{
      flex: 1,
      aspectRatio: 1,
      width: '100%',
  },
  panelContainer:{
    flex: 1,
    backgroundColor: 'white',
    width: '80%'
  },
  panelView: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'center',
    width: '100%',
    height: '30%'
  },
  preView: {
    flex: 4,
    backgroundColor: 'white'
  },
  countText: {
    fontSize: 20,
    fontWeight: 'bold',
    position: 'absolute',
    left: 10,
    top: 10
  },
  captureButton: {
    width: 50,
    height: 50,
    top: 10,
    borderRadius: 50,
    backgroundColor: 'pink'
  },
  flipButton: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
})