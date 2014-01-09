var ChannelUtil = module.exports;

var GLOBAL_CHANNEL_NAME = 'pomelo';
var AREA_CHANNEL_PREFIX = 'area_';
var TEAM_CHANNEL_PREFIX = 'team_';
var ROOM_BLANK_CHANNEL_PREFIX = 'team_blank_';
var ROOM_LIGHT_CHANNEL_PREFIX = 'team_light_';

ChannelUtil.getGlobalChannelName = function() {
  return GLOBAL_CHANNEL_NAME;
};

ChannelUtil.getAreaChannelName = function(areaId) {
  return AREA_CHANNEL_PREFIX + areaId;
};

ChannelUtil.getTeamChannelName = function(teamId) {
  return TEAM_CHANNEL_PREFIX + teamId;
};

ChannelUtil.getBlankChannel = function() {
    return ROOM_BLANK_CHANNEL_PREFIX ;
};

ChannelUtil.getLightChannel = function() {
    return ROOM_LIGHT_CHANNEL_PREFIX ;
};


