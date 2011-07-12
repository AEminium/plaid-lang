/*This file defines the type of JavaScript object that represents Plaid objects at runtime*/

/*Helper method clones objects and arrays*/
Object.prototype.clone = function() {
  var obj = (this instanceof Array) ? [] : {};
  var i;
  for (i in this) {
    if (i == 'clone') continue;
    if (this[i] && typeof this[i] == "object") {
      obj[i] = this[i].clone();
    } else obj[i] = this[i]
  } return obj;
}

/*Constructor
function PlaidState(t){
   this.tree=t;
}
*/

/*Constructor*/
function PlaidState(){
}

/*set the tree equal to the argument passed in*/
PlaidState.prototype.setTree = function(t) {
   this.tree=t;
}

/*Deletes the member that was passed in from the tree of the object on which method was called*/
function s_remove(md1, member){
   var memberList=md1[0][1];
   var memberLength=memberList.length;
   for (var i=0;i<memberLength;i++){
      if (memberList[i]===member){
         memberList=memberList.splice(i,1);
         return true;
      }
   }
   var length=md1.length;
   for (var i=1;i<length;i++){
      var removed=s_remove(md1[i],member);
      if(removed===true){
      return true;
      }
   }
   return false;
}

/*Renames member as newName in the tree of the object on which method was called*/
function s_rename(md1, member, newName){
   var memberList=md1[0][1];
   var memberLength=memberList.length;
   for (var i=0;i<memberLength;i++){
      if (memberList[i]===member){
         memberList[i]=newName;
         return true;
      }
   }
   var length=md1.length;
   for (var i=1;i<length;i++){
      var renamed=s_rename(md1[i],member,newName);
      if(renamed===true){
      return true;
      }
   }
   return false;
}

/*returns an array of all the fields and methods of the state that is reflected in the current metadata*/
function s_members(md1){
   var memberList=md1[0][1];
   var length=md1.length;
   for (var i=1;i<length;i++){
      memberList=memberList.concat(s_members(md1[i]));
   }
   return memberList;
}

/*returns an array of all the fields and methods of the object on which the function is called*/
PlaidState.prototype.members=function() {
   return s_members(this.tree);
}

/*returns a PlaidObject created from the PlaidState on which the function is called*/
PlaidState.prototype.instantiate = function() {
   var obj=new PlaidObject(this.tree.clone());
   copyMembers(obj,this);
   return obj;
}

/*returns a copy of the state on which it was called, copy lacks the member that was passed in*/
PlaidState.prototype.remove = function(member) {
   var obj=new PlaidState();
   obj.setTree(this.tree.clone());
   copyMembers(obj,this);
   if(s_remove(obj.tree,member)===false){
      throw "Error: attempt to remove a member "+member+" that does not exist in the state";
      return;
   }
   delete obj[member];
   return obj;
}

/*returns a copy of the state on which it was called, in copy member has the name newName*/
PlaidState.prototype.rename = function(member, newName) {
   var currMembers=this.members();
   if (has(currMembers,newName)){
      throw "Error: attempt to rename a member with name "+newName+" which already names a member";
   }
   var obj=new PlaidState();
   obj.setTree(this.tree.clone());
   copyMembers(obj,this);
   if(s_rename(obj.tree,member,newName)===false){
      throw "Error: attempt to rename a member "+member+" that does not exist in the state";
      return;
   }
   addMember(obj, newName, obj[member]);
   delete obj[member];
   return obj;
}

/*returns an array of all the fields and methods associated with the given tag, if the tag is found; returns empty array if tag not present*/
function membersByTag(md1,tag){
   if (md1[0][0]===tag){
      return md1[0][1];
   }
   else{
      var length=md1.length;
      for (var i=1;i<length;i++){
         var members = membersByTag(md1[i],tag);
         if (members!==[]){
            return members;
         }
      }
   }
   return [];
}

/*returns a copy of the state on which it was called, in copy member has the value passed in; the member is associated with the tag passed in*/
PlaidState.prototype.specialize = function(tag, member, value) {
   var currMembers=this.members();
   var obj=new PlaidState();
   obj.setTree(this.tree.clone());
   var tagMembers=membersByTag(obj.tree,tag);
   copyMembers(obj,this);

   if (!has(tagMembers,member)){
      //if the member is already in the object and associated with any tag but the target tag, this is an error
      if(has(currMembers,member)){
         throw "Error: attempt to associate member "+member+" with tag "+tag+" which already names a member of another tag";  
      }
      //the member is not yet associated with the given tag and must be added to the tree
      else{
         tagMembers.push(member);
      }
   }
   addMember(obj,member,value);
   return obj;
}

/*returns an array of all the tags of the state that is reflected in the current metadata*/
function s_tags(md1){
   var tagList=[];
   if (md1[0][0]!==""){
      tagList=[md1[0][0]];
   }
   var length=md1.length;
   for (var i=1;i<length;i++){
      tagList=tagList.concat(s_tags(md1[i]));
   }
   return tagList;
}

/*returns a new OBJECT composed of both the state on which the function was called and the state that was passed in (should be object?)*/
PlaidState.prototype.with = function(state) {

   var md1=this.tree;
   var md2=state.tree;

   //check unique tags
   var tags1=s_tags(md1);
   var tags2=s_tags(md2);
   var tags1Length=tags1.length;
   for (var j=0;j<tags1Length;j++){
      if(has(tags2,tags1[j])){
         throw "Error: with operation violates unique tags by containing tag "+tags1[j]+" in both component states";
      }
   } 

   //check unique members
   var members1=s_members(md1);
   var members2=s_members(md2);
   var members1Length=members1.length;
   for (var j=0;j<members1Length;j++){
      if(has(members2,members1[j])){
         throw "Error: with operation violates unique members by containing member "+members1[j]+" in both component states";
      }
   } 

   var obj=new PlaidState();
   obj.setTree(this.tree.clone());
   var i;
   copyMembers(obj,this);
   copyMembers(obj,state);
   var md2Length=md2.length;
   for (var i=1;i<md2Length;i++){
      obj.tree.push(md2[i].clone());
   }  

   return obj;
}

/*Returns true if item is contained in array, false if it is not*/
function has(array, item){
   var length=array.length;
   for (var i=0;i<length;i++){
      if (array[i]===item){
         return true;
      }
   }
   return false;
}

/*copies members of obj2 to obj1*/
function copyMembers(obj1,obj2){
   var i;
   for (i in obj2) {
      if (i==="tree" || i==="instantiate" || i==="members" || i==="remove" || i==="rename" || i==="with" || i==="specialize" || i==="setTree" || i==="clone") {
         continue;
      }
      else {
         addMember(obj1,i,obj2[i]);
      } 
   }
   return;
}

/*a helper function that adds member to obj1, giving it the name memberName;  currently just copies all members and adds the copy;  in future, could be made more efficient*/
function addMember(obj1,memberName,member){
      if (typeof member == "object") {
         obj1[memberName]=member.clone();
      } 
      else {
         obj1[memberName] = member;
      }
}
