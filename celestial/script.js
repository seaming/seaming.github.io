var ruler;

const VOLUME_CONST = 4.0 / 3.0 * Math.PI;
const PI_SQ = Math.PI * Math.PI;
const GRAVITATIONAL_CONSTANT = 6.67430e-11;

const MASS = ['kg', 'M🜨', 'M☉'];
const LENGTH = ['m', 'km', 'R🜨', 'R☉', 'AU'];
const DENSITY = ['kg/m³', 'g/cm³'];
const DURATION = ['s', 'hour', 'day', 'year'];
const FREQUENCY = ['Hz', 'per hour', 'per day', 'per year'];
const ACCELERATION = ['m/s²', 'g'];
const DIMENSIONLESS = [];

const SYMBOL_TABLE = {
    'kg': 1.0,
    'M🜨': 5.97237e24, // kg
    'M☉': 1.98847e30, // kg
    'm': 1.0,
    'km': 1000.0,
    'R🜨': 6371000.0, // m
    'R☉': 696340000.0, // m
    'AU': 149597870700.0, // m
    'g/cm³': 1000.0,
    'kg/m³': 1.0,
    's': 1.0,
    'hour': 60.0, // s
    'day': 86400.0, // s
    'year': 31557600.0, // s
    'Hz': 1.0,
    'per hour': 1.0 / 60.0, // Hz
    'per day': 1.0 / 86400.0, // Hz
    'per year': 1.0 / 31557600.0, // Hz
    'm/s²': 1.0,
    'g': 9.80665, // m s⁻²
}

function unit_converter(a,b) {
    if (a === b)
        return x => x;
    if (dimension(a) !== dimension(b))
        console.error('Cannot convert a ' + a + ' into a ' + b + '.');
    return x => x * SYMBOL_TABLE[a] / SYMBOL_TABLE[b];
}

function dimension(unit) {
    if (unit == 'dimensionless') return ['dimensionless'];
    return [
        MASS, LENGTH, DENSITY, DURATION, FREQUENCY, ACCELERATION
    ].find(x => x.includes(unit));
}

function measure_text_length(text) {
    ruler.innerText = text;
    return ruler.offsetWidth;
}

function div_wrap(x) {
    var wrapper = document.createElement('div');
    wrapper.appendChild(x);
    return wrapper;
}

function delete_button(is_primary) {
    var button = document.createElement('span');
    button.classList.add('delete');
    button.innerText = '×';

    button.onclick = () => {
        button.parentNode.remove();
        if (is_primary === true) {
            num_primaries -= 1;
            check_primaries();
        }
    }

    return button;
}

function make_row_label(label) {
    var el = document.createElement('div');
    el.classList.add('input-row-label');
    el.innerText = label;
    return el;
}

function make_input_pair(name, units, prepend_name) {
    var container = document.createElement('div');
    container.classList.add('input-pair');

    var input = document.createElement('input');
    input.type = 'text';
    input.name = name.toLowerCase();
    if (prepend_name !== true)
        input.placeholder = name;

    input.oninput = () => {
        if (input.value.length > 0)
            input.style.width = measure_text_length(input.value) + "px";
        else if (!prepend_name)
            input.style.width = measure_text_length(name) + "px";
        else
            input.style.width = "3em";
    }
    input.oninput();

    if (prepend_name === true)
        container.appendChild((() => {
            var el = document.createElement('span');
            el.classList.add('input-pair-label')
            el.innerText = name + ':';
            return el;
        })());

    container.appendChild(input);

    if (units !== undefined && units.length > 0) {
        var unitbox = document.createElement('span');
        unitbox.classList.add('units');
        unitbox.innerText = units[0];

        unitbox.addEventListener('click', () => {
            if (!unitbox.classList.contains('locked')) {
                var currentIndex = units.findIndex(x => x == unitbox.innerText);
                unitbox.innerText = units[(currentIndex + 1) % units.length];
            }
        });

        container.appendChild(unitbox);
    }

    return container;
}

var num_primaries = 0;
var num_primaries_warning;
var primary_watchers = [];

function check_primaries() {
    if (num_primaries > 0) {
        num_primaries_warning.classList.add('hidden');
        (document.getElementById('secondaries')
            .querySelectorAll('.body-entry, input, .units')
            .forEach(x => x.classList.remove('locked')));
    } else {
        num_primaries_warning.classList.remove('hidden');
        (document.getElementById('secondaries')
            .querySelectorAll('.body-entry, input, .units')
            .forEach(x => x.classList.add('locked')));
    };
}

function add_primary(caller) {
    var el = document.createElement('div');
    el.classList.add('body-entry');

    el.appendChild(make_input_pair('Name'));

    var mass = make_input_pair('Mass', MASS, true);
    
    var fields = document.createElement('div');
    fields.classList.add('input-fields');
    fields.appendChild(mass);
    
    var physical_properties = document.createElement('div');
    physical_properties.classList.add('input-row');
    physical_properties.appendChild(make_row_label('Physical properties'));
    physical_properties.append(fields);
    el.appendChild(physical_properties);

    num_primaries += 1;
    check_primaries();
    el.appendChild(delete_button(true));

    caller.parentNode.insertBefore(el, caller);

    for (var [field, f] of primary_watchers) {
        for (var input of document.querySelectorAll('#primaries .body-entry input[name='+field+']')) {
            input.addEventListener('input', f);
            input.nextSibling.addEventListener('click', f);
        }
    }
}

function primary_total_mass() {
    var x = document.getElementById('primaries').querySelectorAll('input[name=mass]');
    x = Array.from(x).map(a => {
        var unit = a.nextSibling.innerText;
        return unit_converter(unit, dimension(unit)[0])(parseFloat(a.value));
    })
    return x.reduce((partial, v) => partial + v, 0) || 0;
}

function add_secondary(caller) {
    if (num_primaries < 1) return;

    var el = document.createElement('div');
    el.classList.add('body-entry');

    el.appendChild(make_input_pair('Name'));

    var mass = make_input_pair('Mass', MASS, true);
    var radius = make_input_pair('Radius', LENGTH, true);
    var density = make_input_pair('Density', DENSITY, true);
    var surface_gravity = make_input_pair('Surface gravity', ACCELERATION, true);

    var fields = document.createElement('div');
    fields.classList.add('input-fields');
    fields.appendChild(mass);
    fields.appendChild(radius);
    fields.appendChild(density);
    fields.appendChild(surface_gravity);

    linked_triple(mass, radius, density,
        (r,d) => VOLUME_CONST*r*r*r * d,
        (m,d) => Math.pow((m/d) / VOLUME_CONST, 1/3),
        (m,r) => m / (VOLUME_CONST*r*r*r));

    linked_triple(mass, radius, surface_gravity,
        (r,g) => r*r*g / GRAVITATIONAL_CONSTANT,
        (m,g) => Math.sqrt(GRAVITATIONAL_CONSTANT * m / g),
        (m,r) => GRAVITATIONAL_CONSTANT * m / (r*r))

    var physical_properties = document.createElement('div');
    physical_properties.classList.add('input-row');
    physical_properties.appendChild(make_row_label('Physical properties'));
    physical_properties.append(fields);
    el.appendChild(physical_properties);

    var rotation_rate = make_input_pair('Rotation rate', FREQUENCY, true);
    var flattening_coefficient = make_input_pair('Flattening coefficient', DIMENSIONLESS, true);

    var fields = document.createElement('div');
    fields.classList.add('input-fields');
    fields.appendChild(rotation_rate);
    fields.appendChild(flattening_coefficient);

    linked_triple(density, rotation_rate, flattening_coefficient,
        (n,f) => 15*Math.PI/4 * n*n/(GRAVITATIONAL_CONSTANT * f),
        (d,f) => Math.sqrt(4 * f / (15 * Math.PI) * GRAVITATIONAL_CONSTANT * d),
        (d,n) => 15*Math.PI/4 * n*n/(GRAVITATIONAL_CONSTANT * d));

    var rotational_properties = document.createElement('div');
    rotational_properties.classList.add('input-row');
    rotational_properties.appendChild(make_row_label('Rotational properties'));
    rotational_properties.append(fields);
    el.appendChild(rotational_properties);

    var semimajor_axis = make_input_pair('Semi-major axis', LENGTH, true);
    var periapsis = make_input_pair('Periapsis', LENGTH, true);
    var apoapsis = make_input_pair('Apoapsis', LENGTH, true);
    var eccentricity = make_input_pair('Eccentricity', DIMENSIONLESS, true);
    var period = make_input_pair('Orbital period', DURATION, true);

    var fields = document.createElement('div');
    fields.classList.add('input-fields');
    fields.appendChild(semimajor_axis);
    fields.appendChild(periapsis);
    fields.appendChild(apoapsis);
    fields.appendChild(eccentricity);
    fields.appendChild(period);

    var f = linked_pair(semimajor_axis, period,
        t => Math.pow(t*t/(4*PI_SQ) * primary_total_mass() * GRAVITATIONAL_CONSTANT, 1/3),
        a => 2 * Math.PI * Math.sqrt(a*a*a/(GRAVITATIONAL_CONSTANT * primary_total_mass())),
        { 'watch': document.getElementById('primaries').querySelectorAll('input[name=mass]') });

    primary_watchers.push(['mass', f]);

    linked_triple(semimajor_axis, periapsis, apoapsis,
        (p,a) => (p+a) / 2.0,
        (sma,a) => 2.0 * sma - a,
        (sma,p) => 2.0 * sma - p);
    
    linked_triple(semimajor_axis, periapsis, eccentricity,
        (p,e) => p / (1-e),
        (a,e) => a * (1-e),
        (a,p) => 1 - p/a);

    var orbital_properties = document.createElement('div');
    orbital_properties.classList.add('input-row');
    orbital_properties.appendChild(make_row_label('Orbital properties'));
    orbital_properties.append(fields);
    el.appendChild(orbital_properties);

    {
        var x = document.createElement('div');
        x.innerHTML = '<div class="body-list"><div class="add-another" onclick="add_tertiary(this)">Add moon</div></div>';
        el.appendChild(x.firstChild);
    }

    el.appendChild(delete_button());

    caller.parentNode.insertBefore(el, caller);
}

function add_tertiary(caller) {
    var el = document.createElement('div');
    el.classList.add('body-entry');

    el.appendChild(make_input_pair('Name'));

    var mass = make_input_pair('Mass', MASS, true);
    var radius = make_input_pair('Radius', LENGTH, true);
    var density = make_input_pair('Density', DENSITY, true);
    var surface_gravity = make_input_pair('Surface gravity', ACCELERATION, true);

    var fields = document.createElement('div');
    fields.classList.add('input-fields');
    fields.appendChild(mass);
    fields.appendChild(radius);
    fields.appendChild(density);
    fields.appendChild(surface_gravity);

    linked_triple(mass, radius, density,
        (r,d) => VOLUME_CONST*r*r*r * d,
        (m,d) => Math.pow((m/d) / VOLUME_CONST, 1/3),
        (m,r) => m / (VOLUME_CONST*r*r*r));

    linked_triple(mass, radius, surface_gravity,
        (r,g) => r*r*g / GRAVITATIONAL_CONSTANT,
        (m,g) => Math.sqrt(GRAVITATIONAL_CONSTANT * m / g),
        (m,r) => GRAVITATIONAL_CONSTANT * m / (r*r))

    var physical_properties = document.createElement('div');
    physical_properties.classList.add('input-row');
    physical_properties.appendChild(make_row_label('Physical properties'));
    physical_properties.append(fields);
    el.appendChild(physical_properties);

    var semimajor_axis = make_input_pair('Semi-major axis', LENGTH, true);
    var periapsis = make_input_pair('Periapsis', LENGTH, true);
    var apoapsis = make_input_pair('Apoapsis', LENGTH, true);
    var eccentricity = make_input_pair('Eccentricity', DIMENSIONLESS, true);
    var period = make_input_pair('Orbital period', DURATION, true);

    var fields = document.createElement('div');
    fields.classList.add('input-fields');
    fields.appendChild(semimajor_axis);
    fields.appendChild(periapsis);
    fields.appendChild(apoapsis);
    fields.appendChild(eccentricity);
    fields.appendChild(period);

    function primary_total_mass() {
        var primary = caller.parentNode.parentNode;
        var input = primary.querySelector('input[name=mass]');
        var unit = input.nextSibling.innerText;
        return unit_converter(unit, dimension(unit)[0])(parseFloat(input.value) || 0);
    }

    linked_pair(semimajor_axis, period,
        t => Math.pow(t*t/(4*PI_SQ) * primary_total_mass() * GRAVITATIONAL_CONSTANT, 1/3),
        a => 2 * Math.PI * Math.sqrt(a*a*a/(GRAVITATIONAL_CONSTANT * primary_total_mass())),
        { 'watch': caller.parentNode.parentNode.querySelectorAll('input[name=mass]') });

    linked_triple(semimajor_axis, periapsis, apoapsis,
        (p,a) => (p+a) / 2.0,
        (sma,a) => 2.0 * sma - a,
        (sma,p) => 2.0 * sma - p);
    
    linked_triple(semimajor_axis, periapsis, eccentricity,
        (p,e) => p / (1-e),
        (a,e) => a * (1-e),
        (a,p) => 1 - p/a);

    var orbital_properties = document.createElement('div');
    orbital_properties.classList.add('input-row');
    orbital_properties.appendChild(make_row_label('Orbital properties'));
    orbital_properties.append(fields);
    el.appendChild(orbital_properties);

    el.appendChild(delete_button());

    caller.parentNode.insertBefore(el, caller);
}

var sync_lock = 0;

function linked_pair(a, b, f_a, f_b, params) {
    var id = sync_lock;
    sync_lock += 1;

    var a = {
        'input': a.getElementsByTagName('input')[0],
        'units': a.getElementsByClassName('units')[0],
    };
    
    var b = {
        'input': b.getElementsByTagName('input')[0],
        'units': b.getElementsByClassName('units')[0],
    };

    function f(event) {
        if (event.source_id == id) return;

        a.value = parseFloat(a.input.value);
        a.unit = a.units.innerText;
        b.value = parseFloat(b.input.value);
        b.unit = b.units.innerText;

        var e = new Event('input');
        e.source_id = id;

        if (a.input.value.length > 0 && a.input.dataset.locked_by != id) {
            b.input.disabled = true;
            b.input.dataset.locked_by = id;
            b.input.value = unit_converter(dimension(b.unit)[0], b.unit)(f_b(
                unit_converter(a.unit, dimension(a.unit)[0])(a.value)
            ));
            b.input.dispatchEvent(e);
        } else if (b.input.value.length > 0 && b.input.dataset.locked_by != id) {
            a.input.disabled = true;
            a.input.dataset.locked_by = id;
            a.input.value = unit_converter(dimension(a.unit)[0], a.unit)(f_a(
                unit_converter(b.unit, dimension(b.unit)[0])(b.value),
            ));
            a.input.dispatchEvent(e);
        } else {
            if (a.input.dataset.locked_by == id) {
                a.input.disabled = false;
                delete a.input.dataset.locked_by;
                a.input.value = '';
                a.input.dispatchEvent(e);
            }
            if (b.input.dataset.locked_by == id) {
                b.input.disabled = false;
                delete b.input.dataset.locked_by;
                b.input.value = '';
                b.input.dispatchEvent(e);
            }
        }
    }

    a.input.addEventListener('input', f);
    a.units.addEventListener('click', f);
    b.input.addEventListener('input', f);
    b.units.addEventListener('click', f);

    if (params !== undefined) {
        if ('watch' in params) {
            params['watch'].forEach(input => {
                input.addEventListener('input', f);
                var units = input.nextSibling;
                if (units.classList.contains('units'))
                    units.addEventListener('click', f);
            });
        }
    }
    
    return f;
}

function linked_triple(a, b, c, f_a, f_b, f_c) {
    var id = sync_lock;
    sync_lock += 1;

    var a = {
        'input': a.getElementsByTagName('input')[0],
        'units': a.getElementsByClassName('units')[0],
    };
    
    var b = {
        'input': b.getElementsByTagName('input')[0],
        'units': b.getElementsByClassName('units')[0],
    };

    var c = {
        'input': c.getElementsByTagName('input')[0],
        'units': c.getElementsByClassName('units')[0],
    };

    function f(event) {
        if (event.source_id == id) return;

        var a_filled = a.input.value.length > 0 && a.input.dataset.locked_by != id;
        var b_filled = b.input.value.length > 0 && b.input.dataset.locked_by != id;
        var c_filled = c.input.value.length > 0 && c.input.dataset.locked_by != id;
        
        a.value = parseFloat(a.input.value);
        a.unit = a.units !== undefined ? a.units.innerText : 'dimensionless';
        b.value = parseFloat(b.input.value);
        b.unit = b.units !== undefined ? b.units.innerText : 'dimensionless';
        c.value = parseFloat(c.input.value);
        c.unit = c.units !== undefined ? c.units.innerText : 'dimensionless';

        var e = new Event('input');
        e.source_id = id;

        if (a_filled && b_filled) {
            c.input.disabled = true;
            c.input.dataset.locked_by = id;
            c.input.value = unit_converter(dimension(c.unit)[0], c.unit)(f_c(
                unit_converter(a.unit, dimension(a.unit)[0])(a.value),
                unit_converter(b.unit, dimension(b.unit)[0])(b.value)
            ));
            c.input.dispatchEvent(e);
        } else if (b_filled && c_filled) {
            a.input.disabled = true;
            a.input.dataset.locked_by = id;
            a.input.value = unit_converter(dimension(a.unit)[0], a.unit)(f_a(
                unit_converter(b.unit, dimension(b.unit)[0])(b.value),
                unit_converter(c.unit, dimension(c.unit)[0])(c.value)
            ));
            a.input.dispatchEvent(e);
        } else if (a_filled && c_filled) {
            b.input.disabled = true;
            b.input.dataset.locked_by = id;
            b.input.value = unit_converter(dimension(b.unit)[0], b.unit)(f_b(
                unit_converter(a.unit, dimension(a.unit)[0])(a.value),
                unit_converter(c.unit, dimension(c.unit)[0])(c.value)
            ));
            b.input.dispatchEvent(e);
        } else {
            if (a.input.dataset.locked_by == id) {
                a.input.disabled = false;
                delete a.input.dataset.locked_by;
                a.input.value = '';
                a.input.dispatchEvent(e);
            }
            if (b.input.dataset.locked_by == id) {
                b.input.disabled = false;
                delete b.input.dataset.locked_by;
                b.input.value = '';
                b.input.dispatchEvent(e);
            }
            if (c.input.dataset.locked_by == id) {
                c.input.disabled = false;
                delete c.input.dataset.locked_by;
                c.input.value = '';
                c.input.dispatchEvent(e);
            }
        }

        a.input.oninput();
        b.input.oninput();
        c.input.oninput();
    }

    a.input.addEventListener('input', f);
    if (a.units !== undefined)
        a.units.addEventListener('click', f);
    b.input.addEventListener('input', f);
    if (b.units !== undefined)
        b.units.addEventListener('click', f);
    c.input.addEventListener('input', f);
    if (c.units !== undefined)
        c.units.addEventListener('click', f);
}

window.onload = () => {
    ruler = document.getElementById('ruler');
    num_primaries_warning = document.getElementById('at-least-one-primary-warning');
};