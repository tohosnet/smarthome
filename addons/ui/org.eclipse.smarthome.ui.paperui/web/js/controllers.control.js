angular.module('SmartHomeManagerApp.controllers.control', []).controller('ControlPageController', function($scope, $routeParams, $location, $timeout, itemRepository) {
    $scope.items = [];
    $scope.selectedTabIndex = 0;
    $scope.tabs = [];

    $scope.next = function() {
    	var newIndex = $scope.selectedTabIndex + 1;
    	if(newIndex > ($scope.tabs.length - 1)) {
    		newIndex = 0;
    	}
    	$scope.selectedTabIndex = newIndex;
	}
    $scope.prev = function() {
    	var newIndex = $scope.selectedTabIndex - 1;
    	if(newIndex < 0) {
    		newIndex = $scope.tabs.length - 1;
    	}
    	$scope.selectedTabIndex = newIndex;
	}

    $scope.refresh = function() {
        itemRepository.getAll(function(items) {
            $scope.tabs = [];
            $scope.items['All'] = items;
            for (var int = 0; int < items.length; int++) {
                var item = items[int];
                if (item.type === 'GroupItem') {
                    if(item.tags.indexOf("home-group") > -1) {
                        $scope.tabs.push({name:item.name, label: item.label});
                    }
                }
            }
            
            $scope.masonry();
        });   
    }
    $scope.refresh();
    
    $scope.getItem = function(itemName) {
    	for (var int = 0; int < $scope.data.items.length; int++) {
            var item = $scope.data.items[int];
            if (item.name === itemName) {
                return item;
            }
        }
    	return null;
	}
    
    $scope.masonry = function() {
        if ($scope.data.items) {
            $timeout(function() {
                new Masonry('.items', {});
            }, 100, false);
        }
	}
    $scope.$watch('data.items', function(value) {
    	$scope.masonry();
    });
    $scope.$watch('selectedTabIndex', function() {
    	$scope.masonry();
	});

}).controller('ControlController', function($scope, $timeout, itemService) {
	$scope.getItemName = function(itemName) {
        return itemName.replace(/_/g, ' ');
    }
	
	$scope.getStateText = function(item) {
		if(item.state === 'Uninitialized') {
			return item.state;
		}
		var state = item.type === 'NumberItem' ? parseFloat(item.state) : item.state;
		
		if(!item.stateDescription || !item.stateDescription.pattern) {
			return state;
		} else {
			return sprintf(item.stateDescription.pattern, state);
		}
    }
	
	$scope.getMinText = function(item) {
		if(!item.stateDescription || !item.stateDescription.minimum) {
			return '';
		} else if (!item.stateDescription.pattern) {
			return item.stateDescription.minimum;
		} else {
			return sprintf(item.stateDescription.pattern, item.stateDescription.minimum);
		}
    }
	
	$scope.getMaxText = function(item) {
		if(!item.stateDescription || !item.stateDescription.maximum) {
			return '';
		} else if (!item.stateDescription.pattern) {
			return item.stateDescription.maximum;
		} else {
			return sprintf(item.stateDescription.pattern, item.stateDescription.maximum);
		}
    }

    var categories = {
		'Alarm' : {},
		'Battery' : {},
		'Blinds' : {},
		'ColorLight' : {
			label: 'Color',
			icon: 'md-icon-wb-incandescent'
		},
		'Contact' : {},
		'DimmableLight' : {
			label: 'Brightness',
			icon: 'md-icon-wb-incandescent'
		},
		'CarbonDioxide' : {
			label: 'CO2'
		},
		'Door' : {},
		'Energy' : {},
		'Fan' : {},
		'Fire' : {},
		'Flow' : {},
		'GarageDoor' : {},
		'Gas' : {},
		'Humidity' : {},
		'Light' : {},
		'Motion' : {},
		'MoveControl' : {},
		'Player' : {},
		'PowerOutlet' : {},
		'Pressure' : {
			// icon: 'home-icon-measure_pressure_bar'
		},
		'Rain' : {},
		'Recorder' : {},
		'Smoke' : {},
		'SoundVolume' : {
			label: 'Volume',
			icon: 'md-icon-volume-up',
			hideSwitch: true
		},
		'Switch' : {},
		'Temperature' : {
		    label: 'Temperature'
		},
		'Water' : {},
		'Wind' : {},
		'Window' : {},
		'Zoom' : {},
    }
    
    $scope.getLabel = function (itemCategory, label, defaultLabel) {
    	if(label) {
    		return label;
    	}
    	
    	if(itemCategory) {
    		var category = categories[itemCategory];
    		if(category) {
    			return category.label ? category.label : itemCategory;
    		} else {
    			return defaultLabel;
    		}
    	} else {
			return defaultLabel;
		}
    }
    $scope.getIcon = function (itemCategory, fallbackIcon) {
    	var defaultIcon = fallbackIcon ? fallbackIcon : 'md-icon-radio-button-off';
    	if(itemCategory) {
    		var category = categories[itemCategory];
    		if(category) {
    			return category.icon ? category.icon : defaultIcon;
    		} else {
    			return defaultIcon;
			}
    	} else {
			return defaultIcon;
		}
    }
    $scope.isHideSwitch = function(itemCategory) {
    	if(itemCategory) {
    		var category = categories[itemCategory];
    		if(category) {
    			return category.hideSwitch;
    		}
    	}
    	return false;
	}
    $scope.isReadOnly = function (item) {
    	return item.stateDescription ? item.stateDescription.readOnly : false;
    }
}).controller('ItemController', function($rootScope, $scope, itemService) {
    $scope.editMode = false;
    $scope.sendCommand = function(command, updateState) {
    	$rootScope.itemUpdates[$scope.item.name] = new Date().getTime();
        itemService.sendCommand({
            itemName : $scope.item.name
        }, command);
        if(updateState) {
            $scope.item.state = command;
        }
    };
    $scope.editState = function() {
        $scope.editMode = true;
    };
    $scope.updateState = function() {
        $scope.sendCommand($scope.item.state, false);
        $scope.editMode = false;
    };
}).controller('DefaultItemController', function($scope, itemService) {

}).controller('SwitchItemController', function($scope, $timeout, itemService) {
    $scope.setOn = function(state) {
        $scope.sendCommand(state);
    }
}).controller('DimmerItemController', function($scope, $timeout, itemService) {
	if($scope.item.state === 'Uninitialized') {
		$scope.item.state = '0';
	} 
	$scope.on = parseInt($scope.item.state) > 0 ? 'ON' : 'OFF';
    
	$scope.setOn = function(on) {
		$scope.on = on === 'ON' ? 'ON' : 'OFF';
		
        $scope.sendCommand(on);
        
        var brightness = parseInt($scope.item.state);
        if(on === 'ON' && brightness === 0) {
        	$scope.item.state = 100;
        }
        if(on === 'OFF' && brightness > 0) {
        	$scope.item.state = 0;
        }
    }
	$scope.pending = false;
	$scope.setBrightness = function(brightness) {
        // send updates every 300 ms only
        if(!$scope.pending) {
            $timeout(function() {
        	    var command = $scope.item.state === 0 ? '0' : $scope.item.state;
                $scope.sendCommand(command);
                $scope.pending = false;
            }, 300);
            $scope.pending = true;
        }
    }
	$scope.$watch('item.state', function() {
		var brightness = parseInt($scope.item.state);
		if(brightness > 0 && $scope.on === 'OFF') {
        	$scope.on = 'ON';
        }
        if(brightness === 0 && $scope.on === 'ON') {
        	$scope.on = 'OFF';
        }
	});
}).controller('ColorItemController', function($scope, $timeout, $element, itemService) {

	function getStateAsObject(state) {
		var stateParts = state.split(",");
		if(stateParts.length == 3) {
			return {
				h: parseInt(stateParts[0]),
				s: parseInt(stateParts[1]),
				b: parseInt(stateParts[2])
			}
		} else {
			return {
				h: 0,
				s: 0,
				b: 0
			}
		}
	}
	
	function toState(stateObject) {
		return Math.ceil(stateObject.h) + ',' + Math.ceil(stateObject.s) + ',' + Math.ceil(stateObject.b);
	}
	
	$scope.setOn = function(on) {
		
		 $scope.sendCommand(on);
        
        if(on === 'ON' && $scope.brightness === 0) {
        	$scope.brightness = 100;
        }
        if(on === 'OFF' && $scope.brightness > 0) {
        	$scope.brightness = 0;
        }
    }
    
	$scope.pending = false;
    
    $scope.setBrightness = function(brightness) {
    	 // send updates every 300 ms only
        if(!$scope.pending) {
        	$timeout(function() {
	        	var brightnessValue = $scope.brightness === 0 ? '0' : $scope.brightness;
		        
	        	 $scope.sendCommand(brightnessValue);
		        
		        var stateObject = getStateAsObject($scope.item.state);
		    	stateObject.b = brightnessValue;
		    	if($scope.on === 'ON' && $scope.brightness === 0) {
		    		$scope.on = 'OFF';
		        }
		        if($scope.on === 'OFF' && $scope.brightness > 0) {
		        	$scope.on = 'ON';
		        }
	        	$scope.pending = false;
	        }, 300);
	        $scope.pending = true;
        }
    }
    
    $scope.setHue = function(hue) {
    	 // send updates every 300 ms only
        if(!$scope.pending) {
            $timeout(function() {
            	var hueValue = $scope.hue === 0 ? '0' : $scope.hue;
            	
            	var stateObject = getStateAsObject($scope.item.state);
            	stateObject.h = hueValue;
            	stateObject.b = $scope.brightness;
            	
            	if (!stateObject.b) {
					stateObject.b = 100;
				}
            	if (!stateObject.s) {
					stateObject.s = 100;
				}

		        if($scope.on === 'OFF') {
		        	$scope.on = 'ON';
		        	$scope.brightness = 100;
		        }
		        
                var itemState = toState(stateObject);
                 
                $scope.sendCommand(itemState);
   
            	$scope.pending = false;
            }, 300);
            $scope.pending = true;
        }
        
    }

    $scope.getHexColor = function(hue) {
        var hsv = tinycolor({
            h : hue,
            s : 1,
            v : 1
        }).toHsv();
        return tinycolor(hsv).toHexString();
    }
    
    var setStates = function() {
    	var stateObject = getStateAsObject($scope.item.state);
    	var hue = stateObject.h;
        var brightness = stateObject.b;
        
        $scope.hue = hue ? hue : 0;
        $scope.brightness = brightness ? brightness : 0;
        $scope.on = $scope.brightness > 0 ? 'ON' : 'OFF';
	}
    
    setStates();
     
    $scope.$watch('item.state', function() {
    	setStates(); 
	});
    
    $scope.$watch('hue', function() {
        var hexColor = $scope.getHexColor($scope.hue);
        $($element).find('.hue .md-thumb').css('background-color', hexColor);
	});
    
    var hexColor =  $scope.getHexColor();
    $($element).find('.hue .md-thumb').css('background-color', hexColor);
}).controller('NumberItemController', function($scope) {
	$scope.shouldRenderSlider = function(item) {
		if(item.stateDescription) {
			var stateDescription = item.stateDescription;
			if(stateDescription.readOnly) {
				return false;
			} else {
				if(stateDescription.minimum && stateDescription.maximum) {
					return true;
				} else {
					return false;
				}
			}
		}
		return false;
	}
}).controller('RollershutterItemController', function($scope) {
	
}).controller('PlayerItemController', function($scope) {

});
