# FateLang
Made by Pavi, MatthewProSkills, and PowerCoder

### **Note: ALL Changable Values Are Defined By `{}`**
 
### **`Functions`**
##### Defining
```
fun {name} (args*) {
 {code}
} 
```
##### Calling
```
{name}(args*)
```
### **`Variables`**
#### Defining
```
set {name} = {value}
```
#### Calling
```
{name}
```
#### ** `ARRAY / OBJECTS`**
```
EXAMPLE:
set x = {'any': 'hello'}
print(x.any)
x = ['other']
print(x[0])
```
#### `Loops`
```
loop {start} > {var} > {end} > {skip} {
	{code}
}
EXAMPLE:
loop 0 > x > 10 > 2 {
  print('hello', x)
}
```
# **`Ask / If`**
```
ask:true == true then:
	print('yes')
else:
	print('no')
----OR----
if:true == true then:
	print('yes')
else:
	print('no')
```
# `Inbuilt:`
### DO MATH
```
set x = doMath('1+1')
```
### **`Import`**
```
import("{package_name}")
```


# `UNDER CONSTRUCTION`
### **`Space Manipulators`**
```
\n(<amm>)
```
Specifies the new line ammount.
```
\s(<amm>)
```
Specifies the space ammount.
```
\t(<amm>)
```
Specifies the tab ammount.
