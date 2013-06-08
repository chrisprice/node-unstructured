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

//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvdW5zdHJ1Y3R1cmVkL3Rlc3QvZXhhbXBsZS9hL2IvQy5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy91bnN0cnVjdHVyZWQvdGVzdC9leGFtcGxlMi9hL0MuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvdW5zdHJ1Y3R1cmVkL3Rlc3QvZXhhbXBsZTIvYS9CLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL3Vuc3RydWN0dXJlZC90ZXN0L2V4YW1wbGUvYS9BLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL3Vuc3RydWN0dXJlZC90ZXN0L2V4YW1wbGUvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNOQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiYS5iLkMgPSBmdW5jdGlvbigpIHtcbn07XG5cbmEuYi5DLlNUQVRJQ19WQUxVRSA9IDE7IiwiYS5DID0gZnVuY3Rpb24oKSB7XG5cbn07XG5cbmEuQy5wcm90b3R5cGUudGVzdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBhLmIuQy5TVEFUSUNfVkFMVUU7XG59OyIsImEuQiA9IGZ1bmN0aW9uKCkge1xuXG59O1xuXG5hLkIucHJvdG90eXBlLnRlc3QgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gYS5DLlNUQVRJQ19WQUxVRTtcbn07IiwiYS5BID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5iID0gbmV3IGEuQigpO1xufTtcblxuYS5BLnByb3RvdHlwZS50ZXN0ID0gZnVuY3Rpb24oKSB7XG5cbn07IiwidmFyIGEgPSBuZXcgYS5BKCk7XG4iXX0=