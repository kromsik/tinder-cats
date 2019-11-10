import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  Animated,
  PanResponder,
  TouchableOpacity,
  ActivityIndicator,
  PanResponderInstance,
} from 'react-native'
import clamp from 'clamp'
import { Cat1, Cat2, Cat3, Cat4 } from './Cats'

const SWIPE_THRESHOLD = 120

interface CatData {
  image: any
  id: number
  text: string
}

interface State {
  items: CatData[]
  isReady: boolean
}

export default class App extends React.Component<any, State> {
  public state = {
    isReady: false,
    items: [
      {
        image: Cat1,
        id: 1,
        text: 'Sweet Cat',
      },
      {
        image: Cat2,
        id: 2,
        text: 'Sweeter Cat',
      },
      {
        image: Cat3,
        id: 3,
        text: 'Sweetest Cat',
      },
      {
        image: Cat4,
        id: 4,
        text: 'Aww',
      },
    ],
  }
  public animation = new Animated.ValueXY()
  public opacity = new Animated.Value(1)
  public next = new Animated.Value(0.9)
  private _panResponder: PanResponderInstance

  componentDidMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([
        null,
        {
          dx: this.animation.x,
          dy: this.animation.y,
        },
      ]),
      onPanResponderRelease: (e, { dx, vx, vy }) => {
        let velocity

        if (vx >= 0) {
          velocity = clamp(vx, 3, 5)
        } else if (vx < 0) {
          velocity = clamp(Math.abs(vx), 3, 5) * -1
        }

        if (Math.abs(dx) > SWIPE_THRESHOLD) {
          Animated.decay(this.animation, {
            velocity: { x: velocity, y: vy },
            deceleration: 0.98,
          }).start(this.transitionNext)
        } else {
          Animated.spring(this.animation, {
            toValue: { x: 0, y: 0 },
            friction: 4,
          }).start()
        }
      },
    })
    this.setState({ isReady: true })
  }
  transitionNext = () => {
    Animated.parallel([
      Animated.timing(this.opacity, {
        toValue: 0,
        duration: 300,
      }),
      Animated.spring(this.next, {
        toValue: 1,
        friction: 4,
      }),
    ]).start(() => {
      this.setState(
        (state) => {
          return {
            items: state.items.slice(1),
          }
        },
        () => {
          this.next.setValue(0.9)
          this.opacity.setValue(1)
          this.animation.setValue({ x: 0, y: 0 })
        }
      )
    })
  }
  handleNo = () => {
    Animated.timing(this.animation.x, {
      toValue: -SWIPE_THRESHOLD,
    }).start(this.transitionNext)
  }
  handleYes = () => {
    Animated.timing(this.animation.x, {
      toValue: SWIPE_THRESHOLD,
    }).start(this.transitionNext)
  }

  render() {
    const { animation, _panResponder } = this
    const { isReady } = this.state

    const rotate = animation.x.interpolate({
      inputRange: [-200, 0, 200],
      outputRange: ['-30deg', '0deg', '30deg'],
      extrapolate: 'clamp',
    })

    const opacity = animation.x.interpolate({
      inputRange: [-200, 0, 200],
      outputRange: [0.5, 1, 0.5],
    })

    const yesOpacity = animation.x.interpolate({ inputRange: [0, 150], outputRange: [0, 1] })
    const yesScale = animation.x.interpolate({
      inputRange: [0, 150],
      outputRange: [0.5, 1],
      extrapolate: 'clamp',
    })
    const animatedYupStyles = {
      transform: [{ scale: yesScale }, { rotate: '-30deg' }],
      opacity: yesOpacity,
    }

    const noOpacity = animation.x.interpolate({ inputRange: [-150, 0], outputRange: [1, 0] })
    const noScale = animation.x.interpolate({
      inputRange: [-150, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    })
    const animatedNopeStyles = {
      transform: [{ scale: noScale }, { rotate: '30deg' }],
      opacity: noOpacity,
    }

    const animatedCardStyles = {
      transform: [{ rotate }, ...this.animation.getTranslateTransform()],
      opacity: this.opacity,
    }

    const animatedImageStyles = {
      opacity,
    }
    if (!isReady) {
      return (
        <View style={styles.container}>
          <View style={styles.top}>
            <ActivityIndicator />
          </View>
        </View>
      )
    } else {
      return (
        <View style={styles.container}>
          <View style={styles.top}>
            {this.state.items
              .slice(0, 2)
              .reverse()
              .map(({ image, id, text }, index, items) => {
                const isLastItem = index === items.length - 1
                const isSecondToLast = index === items.length - 2

                const panHandlers = isLastItem ? _panResponder.panHandlers : {}
                const cardStyle = isLastItem ? animatedCardStyles : undefined
                const imageStyle = isLastItem ? animatedImageStyles : undefined
                const nextStyle = isSecondToLast ? { transform: [{ scale: this.next }] } : undefined

                return (
                  <Animated.View
                    {...panHandlers}
                    style={[styles.card, cardStyle, nextStyle]}
                    key={id}
                  >
                    <Animated.Image
                      source={image}
                      style={[styles.image, imageStyle]}
                      resizeMode="cover"
                    />
                    <View style={styles.lowerText}>
                      <Text>{text}</Text>
                    </View>

                    {isLastItem && (
                      <Animated.View style={[styles.nope, animatedNopeStyles]}>
                        <Text style={styles.nopeText}>Nope!</Text>
                      </Animated.View>
                    )}

                    {isLastItem && (
                      <Animated.View style={[styles.yup, animatedYupStyles]}>
                        <Text style={styles.yupText}>Yup!</Text>
                      </Animated.View>
                    )}
                  </Animated.View>
                )
              })}
          </View>
          <View style={styles.buttonBar}>
            <TouchableOpacity onPress={this.handleNo} style={[styles.button, styles.nopeButton]}>
              <Text style={styles.nopeText}>NO</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={this.handleYes} style={[styles.button, styles.yupButton]}>
              <Text style={styles.yupText}>YES</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  top: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  button: {
    marginHorizontal: 10,
    padding: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 5,
  },
  yupButton: {
    shadowColor: 'green',
  },
  nopeButton: {
    shadowColor: 'red',
  },

  card: {
    width: 300,
    height: 300,
    position: 'absolute',
    borderRadius: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    // shadowOffset: { x: 0, y: 0 },
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  lowerText: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 5,
  },
  image: {
    width: null,
    height: null,
    borderRadius: 2,
    flex: 3,
  },
  yup: {
    borderColor: 'green',
    borderWidth: 2,
    position: 'absolute',
    padding: 20,
    borderRadius: 5,
    top: 20,
    left: 20,
    backgroundColor: '#FFF',
  },
  yupText: {
    fontSize: 16,
    color: 'green',
  },
  nope: {
    borderColor: 'red',
    borderWidth: 2,
    position: 'absolute',
    padding: 20,
    borderRadius: 5,
    right: 20,
    top: 20,
    backgroundColor: '#FFF',
  },
  nopeText: {
    fontSize: 16,
    color: 'red',
  },
})
