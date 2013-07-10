/*!
 * Some license or other
 */

var a = a || {};
a.b = a.b || {};
a.b.C = function() {
};

a.b.C.STATIC_VALUE = 1;
var a = a || {};
a.C = function() {

};

a.C.prototype.test = function() {
    return a.b.C.STATIC_VALUE;
};
var a = a || {};
a.B = function() {

};

a.B.prototype.test = function() {
    return a.C.STATIC_VALUE;
};
var a = a || {};
a.A = function() {
    this.b = new a.B();
};

a.A.prototype.test = function() {

};
var anA = new a.A();

console.log('loaded');
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvdW5zdHJ1Y3R1cmVkL3Rlc3QvZXhhbXBsZS9wcmVmaXguanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvdW5zdHJ1Y3R1cmVkL3Rlc3QvZXhhbXBsZS9hL2IvQy5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy91bnN0cnVjdHVyZWQvdGVzdC9leGFtcGxlMi9hL0MuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvdW5zdHJ1Y3R1cmVkL3Rlc3QvZXhhbXBsZTIvYS9CLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL3Vuc3RydWN0dXJlZC90ZXN0L2V4YW1wbGUvYS9BLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL3Vuc3RydWN0dXJlZC90ZXN0L2V4YW1wbGUyL2luZGV4LmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL3Vuc3RydWN0dXJlZC90ZXN0L2V4YW1wbGUvc3VmZml4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBOzs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUNEQSIsInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICogU29tZSBsaWNlbnNlIG9yIG90aGVyXG4gKi9cbiIsImEuYi5DID0gZnVuY3Rpb24oKSB7XG59O1xuXG5hLmIuQy5TVEFUSUNfVkFMVUUgPSAxOyIsImEuQyA9IGZ1bmN0aW9uKCkge1xuXG59O1xuXG5hLkMucHJvdG90eXBlLnRlc3QgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gYS5iLkMuU1RBVElDX1ZBTFVFO1xufTsiLCJhLkIgPSBmdW5jdGlvbigpIHtcblxufTtcblxuYS5CLnByb3RvdHlwZS50ZXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGEuQy5TVEFUSUNfVkFMVUU7XG59OyIsImEuQSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYiA9IG5ldyBhLkIoKTtcbn07XG5cbmEuQS5wcm90b3R5cGUudGVzdCA9IGZ1bmN0aW9uKCkge1xuXG59OyIsInZhciBhbkEgPSBuZXcgYS5BKCk7XG4iLCJjb25zb2xlLmxvZygnbG9hZGVkJyk7Il19