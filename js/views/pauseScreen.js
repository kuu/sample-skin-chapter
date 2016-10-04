/********************************************************************
 PAUSE SCREEN
 *********************************************************************/
var React = require('react'),
    ReactDOM = require('react-dom'),
    ClassNames = require('classnames'),
    ControlBar = require('../components/controlBar'),
    AdOverlay = require('../components/adOverlay'),
    UpNextPanel = require('../components/upNextPanel'),
    TextTrack = require('../components/textTrackPanel'),
    ChapterCarousel = require('../components/chapterCarousel'),
    ResizeMixin = require('../mixins/resizeMixin'),
    Icon = require('../components/icon'),
    Utils = require('../components/utils'),
    AnimateMixin = require('../mixins/animateMixin');

var PauseScreen = React.createClass({
  mixins: [ResizeMixin, AnimateMixin],

  getInitialState: function() {
    return {
      descriptionText: this.props.contentTree.description,
      controlBarVisible: true
    };
  },

  componentDidMount: function() {
    this.handleResize();
  },

  componentWillUnmount: function() {
    this.props.controller.enablePauseAnimation();
  },

  handleResize: function() {
    if (ReactDOM.findDOMNode(this.refs.description)){
      this.setState({
        descriptionText: Utils.truncateTextToWidth(ReactDOM.findDOMNode(this.refs.description), this.props.contentTree.description)
      });
    }
  },

  handleClick: function(event) {
    event.preventDefault();
    this.props.controller.togglePlayPause();
    this.props.controller.state.accessibilityControlsEnabled = true;
  },

  handleChapterClick: function(offset) {
    this.props.controller.togglePlayPause();
    this.props.controller.seek(offset / 1000);
    this.props.controller.state.accessibilityControlsEnabled = true;
  },

  render: function() {
    //inline style for config/skin.json elements only
    var titleStyle = {
      color: this.props.skinConfig.startScreen.titleFont.color
    };
    var descriptionStyle = {
      color: this.props.skinConfig.startScreen.descriptionFont.color
    };
    var actionIconStyle = {
      color: this.props.skinConfig.pauseScreen.PauseIconStyle.color,
      opacity: this.props.skinConfig.pauseScreen.PauseIconStyle.opacity
    };

    //CSS class manipulation from config/skin.json
    var fadeUnderlayClass = ClassNames({
      'oo-fading-underlay': !this.props.pauseAnimationDisabled,
      'oo-fading-underlay-active': this.props.pauseAnimationDisabled,
      'oo-animate-fade': this.state.animate && !this.props.pauseAnimationDisabled
    });
    var infoPanelClass = ClassNames({
      'oo-state-screen-info': true,
      'oo-info-panel-top': this.props.skinConfig.pauseScreen.infoPanelPosition.toLowerCase().indexOf("top") > -1,
      'oo-info-panel-bottom': this.props.skinConfig.pauseScreen.infoPanelPosition.toLowerCase().indexOf("bottom") > -1,
      'oo-info-panel-left': this.props.skinConfig.pauseScreen.infoPanelPosition.toLowerCase().indexOf("left") > -1,
      'oo-info-panel-right': this.props.skinConfig.pauseScreen.infoPanelPosition.toLowerCase().indexOf("right") > -1
    });
    var titleClass = ClassNames({
      'oo-state-screen-title': true,
      'oo-text-truncate': true,
      'oo-pull-right': this.props.skinConfig.pauseScreen.infoPanelPosition.toLowerCase().indexOf("right") > -1
    });
    var descriptionClass = ClassNames({
      'oo-state-screen-description': true,
      'oo-pull-right': this.props.skinConfig.pauseScreen.infoPanelPosition.toLowerCase().indexOf("right") > -1
    });
    var actionIconClass = ClassNames({
      'oo-action-icon-pause': !this.props.pauseAnimationDisabled,
      'oo-action-icon': this.props.pauseAnimationDisabled,
      'oo-animate-pause': this.state.animate && !this.props.pauseAnimationDisabled,
      'oo-action-icon-top': this.props.skinConfig.pauseScreen.pauseIconPosition.toLowerCase().indexOf("top") > -1,
      'oo-action-icon-bottom': this.props.skinConfig.pauseScreen.pauseIconPosition.toLowerCase().indexOf("bottom") > -1,
      'oo-action-icon-left': this.props.skinConfig.pauseScreen.pauseIconPosition.toLowerCase().indexOf("left") > -1,
      'oo-action-icon-right': this.props.skinConfig.pauseScreen.pauseIconPosition.toLowerCase().indexOf("right") > -1,
      'oo-hidden': !this.props.skinConfig.pauseScreen.showPauseIcon || this.props.pauseAnimationDisabled
    });

    var titleMetadata = (<div className={titleClass} style={titleStyle}>{this.props.contentTree.title}</div>);
    var descriptionMetadata = (<div className={descriptionClass} ref="description" style={descriptionStyle}>{this.state.descriptionText}</div>);
    var adOverlay = (this.props.controller.state.adOverlayUrl && this.props.controller.state.showAdOverlay) ?
      <AdOverlay {...this.props}
        overlay={this.props.controller.state.adOverlayUrl}
        showOverlay={this.props.controller.state.showAdOverlay}
        showOverlayCloseButton={this.props.controller.state.showAdOverlayCloseButton}/> : null;

    var upNextPanel = (this.props.controller.state.upNextInfo.showing && this.props.controller.state.upNextInfo.upNextData) ?
      <UpNextPanel {...this.props}
        controlBarVisible={this.state.controlBarVisible}
        currentPlayhead={this.props.currentPlayhead}/> : null;

    var chapters = this.props.skinConfig.chapters;
    var thumbnailData = {};
    var timeSlices = [];
    var thumbnails;

    if (chapters && chapters.length) {
      chapters.forEach(function (chapter) {
        timeSlices.push(chapter.time);
        thumbnailData[chapter.time] = {
          "200": {
            url: chapter.url,
            title: chapter.title,
            time: chapter.time,
            width: 200,
            height: 200 * chapter.height / chapter.width
          }
        };
      });

      thumbnails = {
        data: {
          available_time_slices: timeSlices,
          available_widths: [200],
          thumbnails: thumbnailData
        }
      };
    }

    var chapterCarousel = !thumbnails ? null :
      <ChapterCarousel
        pausing={true}
        thumbnails={thumbnails}
        duration={120000}
        hoverTime={60000}
        scrubberBarWidth={this.props.componentWidth}
        playStartCallback={this.handleChapterClick} />;

    return (
      <div className="oo-state-screen oo-pause-screen">
        <div className={fadeUnderlayClass}></div>
        <div className={infoPanelClass}>
          {this.props.skinConfig.pauseScreen.showTitle ? titleMetadata : null}
          {this.props.skinConfig.pauseScreen.showDescription ? descriptionMetadata : null}
        </div>

        <a className="oo-state-screen-selectable" onClick={this.handleClick}></a>

        <a className={actionIconClass} onClick={this.handleClick}>
          <Icon {...this.props} icon="pause" style={actionIconStyle}/>
        </a>

        {chapterCarousel}

        <div className="oo-interactive-container">
          {this.props.closedCaptionOptions.enabled ?
            <TextTrack
              closedCaptionOptions={this.props.closedCaptionOptions}
              cueText={this.props.closedCaptionOptions.cueText}
              responsiveView={this.props.responsiveView}
            /> : null
          }

          <a className="oo-state-screen-selectable" onClick={this.handleClick}></a>

          {adOverlay}

          {upNextPanel}

          <ControlBar {...this.props}
            controlBarVisible={this.state.controlBarVisible}
            playerState={this.state.playerState}
            isLiveStream={this.props.isLiveStream}/>
        </div>
      </div>
    );
  }
});
module.exports = PauseScreen;
