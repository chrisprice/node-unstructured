a = a || {};
a.b = a.b || {};
a.b.C = function() {
};

a.b.C.STATIC_VALUE = 1;
a = a || {};
a.C = function() {

};

a.C.prototype.test = function() {
    return a.b.C.STATIC_VALUE;
};
a = a || {};
a.B = function() {

};

a.B.prototype.test = function() {
    return a.C.STATIC_VALUE;
};
a = a || {};
a.A = function() {
    this.b = new a.B();
};

a.A.prototype.test = function() {

};
var a = new a.A();

//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvdW5zdHJ1Y3R1cmVkL3Rlc3QvZXhhbXBsZS9hL2IvQy5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy91bnN0cnVjdHVyZWQvdGVzdC9leGFtcGxlMi9hL0MuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvdW5zdHJ1Y3R1cmVkL3Rlc3QvZXhhbXBsZTIvYS9CLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL3Vuc3RydWN0dXJlZC90ZXN0L2V4YW1wbGUvYS9BLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL3Vuc3RydWN0dXJlZC90ZXN0L2V4YW1wbGUvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJhLmIuQyA9IGZ1bmN0aW9uKCkge1xufTtcblxuYS5iLkMuU1RBVElDX1ZBTFVFID0gMTsiLCJhLkMgPSBmdW5jdGlvbigpIHtcblxufTtcblxuYS5DLnByb3RvdHlwZS50ZXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGEuYi5DLlNUQVRJQ19WQUxVRTtcbn07IiwiYS5CID0gZnVuY3Rpb24oKSB7XG5cbn07XG5cbmEuQi5wcm90b3R5cGUudGVzdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBhLkMuU1RBVElDX1ZBTFVFO1xufTsiLCJhLkEgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmIgPSBuZXcgYS5CKCk7XG59O1xuXG5hLkEucHJvdG90eXBlLnRlc3QgPSBmdW5jdGlvbigpIHtcblxufTsiLCJ2YXIgYSA9IG5ldyBhLkEoKTtcbiJdfQ==