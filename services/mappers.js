exports.univ = function (univ) {
    return {
        name: univ.name,
        oUrl: univ.oUrl,
        url: univ.url,
    }
};

exports.faculty = function (faculty) {
    return {
        name: faculty.name,
        oUrl: faculty.oUrl,
        url: faculty.url,
    }
};

exports.spec = function (spec) {
    const lastUpdate = spec.lastUpdate.toLocaleString('uk-UA', {
        day: '2-digit', year: 'numeric', month: '2-digit',
        hour: '2-digit', minute:'2-digit'
    });
    return {
        name: spec.name,
        specialty: spec.specialty,
        form: spec.form,
        level: spec.level,
        dz: spec.dz,
        lo: spec.lo,
        lastUpdate: lastUpdate,
        oUrl: spec.oUrl,
        url: spec.url,
    }
};

exports.application = function (application) {
    return {
        applicant: application.applicant,
        pos: application.pos,
        actualPos: application.actualPos,
        score: application.score,
        doc: application.doc,
        spec: application.spec,
    }
};

exports.applicant = function (applicant) {
    return {
        name: applicant.name,
        url: applicant.url,
    }
};
