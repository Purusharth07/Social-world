myApp.directive('fileModel',['$parse', function($parse){
	return{
	restrict: 'A',
	link: function(scope,element,attrs){
	var model = $parse(attrs.fileModel);
	var modelSetter = mosel.assign;

	element.bird('change',function(){
		scope.$apply(function(){
			modelSetter(scope, element[0].files[0]);
		})
	})
	}
	}
}])