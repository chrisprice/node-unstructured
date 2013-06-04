var a = a.Module();

var ab = new a.b.Module();
ab.test();

var Abc;
Abc = a.b.c.Module();

var Abd;
Abd = new a.b.d.Module();
Abd.test();

a.b.e.Module();

new a.b.f.Module();

a.Static.test();