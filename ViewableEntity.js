(function (namespace, Entity, M) {

  function ViewableEntity(properties) {
    Entity.call(this, properties);
    this.does("fixViewsToEntity");
  }
  
	ViewableEntity.name = "ViewableEntity";

	M.extend(ViewableEntity, Entity);

	namespace.ViewableEntity = ViewableEntity;
 
 })(Match, M.Entity, M);