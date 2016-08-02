var XMLHttpRequest = require('xhr2');

function LabTech(url, username, password) {
    this._url = url;
    this._username = username;
    this._password = password;
    var _this = this;
    this.buildInstanceVars();
}

/* U R L S */
LabTech.Urls = this.Urls || {};
LabTech.Urls.API = "/WCC2/api/";
LabTech.Urls.Token = "/WCC2/api/APIToken";
LabTech.Urls.Clients = "/WCC2/api/Clients";
LabTech.Urls.Locations = "/WCC2/api/Locations";
LabTech.Urls.TicketStubs = "/WCC2/api/TicketStubs";
LabTech.Urls.Tickets = "/WCC2/api/Tickets";
LabTech.Urls.TicketTemplate = "/WCC2/Tickets/Detail";
LabTech.Urls.TicketData = "/WCC2/api/TicketData";
LabTech.Urls.TicketPriorities = "/WCC2/api/TicketPriorities";
LabTech.Urls.ClientStubs = "/WCC2/api/ClientStubs";
LabTech.Urls.ComputerStubs = "/WCC2/api/ComputerStubs";
LabTech.Urls.Computers = "/WCC2/api/Computers";
LabTech.Urls.Users = "/WCC2/api/Users";
LabTech.Urls.ScriptStubs = "/WCC2/api/ScriptStubs";
LabTech.Urls.ScriptFolders = "/WCC2/api/ScriptFolders";
LabTech.Urls.Commands = "/WCC2/api/Commands";
LabTech.Urls.Passwords = "/WCC2/api/Passwords";
LabTech.Urls.ProductKeys = "/WCC2/api/ProductKeys";
LabTech.Urls.Reports = "/WCC2/api/Reports";
LabTech.Urls.ReportFolders = "/WCC2/api/ReportFolders";
LabTech.Urls.ReportViewer = "/WCC2/ReportViewer.aspx";
LabTech.Urls.generateInstallPackage = "/Labtech/Deployment.aspx";
LabTech.Urls.Timers = "/WCC2/api/Timers";
LabTech.Urls.TimeCategories = "/WCC2/api/TimeCategories";
LabTech.Urls.PluginsApi = "/WCC2/api/Plugins";
/*****************************************************************/

LabTech.prototype.buildInstanceVars = function () {
    /* P R O P E R T I E S */
    this.Props = LabTech.Props || {};
    this.Props.Token = "";
    /*****************************************************************/
}

LabTech.prototype.buildRepositories = function (token) {

    this.Computers = new BaseRepository(this._url + LabTech.Urls.Computers, "ComputerID", token);
    this.Clients = new ClientRepository(this._url, token);

    /* TODO: Add these as they are needed/tested
    this.Alerts = new AlertRepository();
    this.AutoStartups = new AutoStartups();
    this.AutoStartupsStubs = new BaseRepository(LabTech.Urls.AutoStartupsStubs);
    this.ClientStubs = new BaseRepository(LabTech.Urls.ClientStubs);
    this.CommandLookup = new BaseRepository(LabTech.Urls.CommandLookup);
    this.Commands = new CommandsRepository();
    this.ComputerStubs = new BaseRepository(LabTech.Urls.ComputerStubs);
    this.Contracts = new ContractsRepository();
    this.DriveStubs = new DriveStubsRepository();
    this.Hotfixes = new HotfixRepository();
    this.HotfixStubs = new BaseRepository(LabTech.Urls.HotfixStubs);
    this.Locations = new LocationRepository();
    this.Monitors = new MonitorRepository();
    this.Passwords = new PasswordRepository();
    this.Printers = new PrintersRepository();
    this.ProcessDefinitions - new ProcessDefinitionsRepository();
    this.Processes = new ProcessRepository();
    this.ProcessStubs = new BaseRepository(LabTech.Urls.ProcessStubs);
    this.ProductKeys = new ProductKeysRepository();
    this.ReportFolders = new ReportFoldersRepository();
    this.Reports = new ReportRepository();
    this.ScriptFolders = new ScriptFolderepository();
    this.ScriptHistoryStubs = new BaseRepository(LabTech.Urls.ScriptHistoryStubs);
    this.ScriptStubs = new BaseRepository(LabTech.Urls.ScriptStubs);
    this.Services = new ServiceRepository();
    this.Software = new SoftwareRepository();
    this.SoftwareStubs = new BaseRepository(LabTech.Urls.SoftwareStubs);
    this.TicketData = new TicketDataRepository();
    this.TicketPriorities = new BaseRepository(LabTech.Urls.TicketPriorities);
    this.Tickets = new BaseRepository(LabTech.Urls.Tickets);
    this.TicketStatuses = new BaseRepository(LabTech.Urls.TicketStatuses);
    this.TicketStubs = new BaseRepository(LabTech.Urls.TicketStubs);
    this.TicketCategories = new BaseRepository(LabTech.Urls.TicketCategories);
    this.Timers = new BaseRepository(LabTech.Urls.Timers);
    this.TimeSlips = new BaseRepository(LabTech.Urls.TimeSlips);
    this.UserPermissionsStubs = new UserPermissionsStubsRepository();
    this.Users = new UsersRepository();
    */
}

LabTech.prototype.AssignToken = function (cb) {
    var url = this._url + LabTech.Urls.Token;
    var _this = this;
    return this.doPost(url, { "username": this._username, "password": this._password }).then(function (result) {
        result = result.replace(/^"(.*)"$/, '$1');  //Strip the " " from the beginning and end
        _this.Props.Token = result;
        _this.buildRepositories(result);
        return result;
    }).catch(function (err) {
        throw (err);
    });
}

LabTech.prototype.doPost = function (url, postBody) {
    return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        req.open("POST", url, true);
        req.setRequestHeader("Accept", "application/json;odata=verbose");
        req.setRequestHeader("Content-Type", "application/json");
        req.onload = function () {
            if (req.status == 200) {
                resolve(req.response);
            }
            else {
                reject(Error(req.response));
            }
        };
        req.onerror = function () {
            reject(Error("Network Error"));
        };
        req.send(JSON.stringify(postBody));
    });
};



function BaseRepository(url, idName, token) {
    if (typeof url !== 'string' || url.length === 0) {
        throw 'invalid url'
    }
    if (typeof idName === 'undefined') {
        idName = '';
    }
    if (typeof token !== 'string' || token.length === 0) {
        throw 'must have token';
    }
    this._url = url;
    this._idName = idName;
    this._token = token;

    /**
    * Reduces the size of entities returned from the server by removing unneeded
    * properties. Reducing is only appropriate for entities that will NOT be sent
    * back to the server. By default it simply returns the entity passed in.
    * @param {number} indexInArray - The index of the entity in the array.
    * @param {any} entity - The entity to reduce.
    * @reutnrs {any} The reduced entity.
    */
    this.EntityReduction = function (entity) {
        return entity;
    };
}

/**
    * Get an entry by its unique ID number from either the cache, if enabled,
    * or the server.
    * @param {number} ID - The unique identifier of the data to retrieve.
    * @returns {jQuery.Promise} A Promise that will resolve() on the successful
    *     retrieval of the data, no matter if it's from the server or cache,
    *     or reject() on an error.
    */
BaseRepository.prototype.GetByID = function (ID, subProperties) {
    var _this = this;
    if (typeof subProperties === 'undefined') {
        subProperties = null;
    }
    var url = this._url + '(' + ID + ')?';
    if (subProperties) {
        url += this.GetExpandPropertiesUrl(subProperties);
    }
    var promise = this.doRequest(url);
    return promise.then(function (result) {
        if (typeof result !== 'object') {
            //  promise.reject();
        }
        result.d = _this.EntityReduction(result);
        return result;
    }).catch(function (err) {
        throw (err);
    });
};

/**
    * Get a page worth of entries from the server.
    * Note: The cache will NOT be checked for the data, however the cache WILL
    * be updated with the retrieved data.
    * @param {Models.GetPageSettings} pageSettings - A set of key/value pairs
    *     that configure the page request. All settings are optional.
    * TODO: TEST TEST TEST TEST TEST
    */
BaseRepository.prototype.GetPage = function (pageSettings) {
    var _this = this;
    if (typeof pageSettings !== 'object' && typeof pageSettings !== 'undefined') {
        throw 'pageSettings is invalid';
    }
    var defaults = {
        pageNumber: 1,
        pageSize: null,
        sort: '',
        filter: '',
        inlinecount: 'allpages',
        queryParameters: ''
    };

    return this.doRequest(this.CreateParameterizedUrl(pageSettings)).then(function (result) {
        if (typeof result !== 'object' || typeof result.value !== 'object' || !(result.value instanceof Array)) {
            return null;
        }
        result.d = {};
        result.d.results = [];
        if (typeof result['@odata.count'] !== 'undefined') {
            result.d.recordCount = result['@odata.count'];
        }
        for (var i = 0; i < result.value.length; i++) {
            result.d.results[i] = _this.EntityReduction(result.value[i]);
        }
        return result;
    }).catch(function (err) {
        throw (err);
    });
};

/**
    * 
    * 
    * 
    * 
    * 
    * TODO: TEST TEST TEST TEST TEST
    */
BaseRepository.prototype.GetCount = function (filter, queryParameters) {
    var _this = this;
    var countUrl = this._url + '/$count?';
    if (filter != null) {
        counturl += '$filter=' + filter;
    }
    if (queryParameters != null) {
        counturl += '&' + queryParameters;
    }
    var promise = this.doRequest(countUrl);
    return promise.then(function (result) {
        //TODO: This is returning a "4" instead of a 4, and therefore is failing this check. Why?
        //if (typeof result !== 'number') {
        //    //reject(result);
        //    return;
        //}
        return result;
    }).catch(function (err) {
        throw (err);
    });
};

/**
    * 
    * 
    * 
    * 
    * 
    * 
    */
BaseRepository.prototype.GetAll = function (pageSettings) {
    var defaults = {
        sort: '',
        sortDir: '',
        filter: '',
        inlinecount: 'allpages',
        queryParameters: ''
    };
    return this.doRequest(this._url);
};

/**
    * 
    * 
    * 
    * 
    * 
    * TODO: TEST TEST TEST TEST TEST
    */
BaseRepository.prototype.ProcessPage = function (data, fullData) {
    var _this = this;
    if (typeof data !== 'object' || typeof data.value !== 'object' || !(data.value instanceof Array)) {

        return;
    }
    if (typeof data['@odata.count'] !== 'undefined') {
        fullData.recordCount = data['@odata.count'];
    }
    if (typeof fullData.results == 'undefined') {
        fullData.results = new Array();
    }
    var currentCount = fullData.results.length;
    for (var i = 0; i < data.value.length; i++) {
        fullData.results[currentCount + i] = this.EntityReduction(data.value[i]);
    }
    var promise = this.doRequest(data['@odata.nextLink']);
    promise.then(function (data) {
        return _this.ProcessPage(data, fullData);
    }).catch(function (err) {
        promise.reject(err);
    });
    promise.resolve(fullData);
    return promise;
};

/**
    * 
    * 
    * 
    * 
    * 
    * TODO: TEST TEST TEST TEST TEST
    */
BaseRepository.prototype.CreateParameterizedUrl = function (pageSettings) {
    var odata = [];
    if (pageSettings.filter !== '') {
        odata.push('$filter=' + pageSettings.filter);
    }
    if (pageSettings.inlinecount !== '') {
        if (pageSettings.inlinecount == 'allpages') {
            odata.push('$count=true');
        } else {
            odata.push('$inlinecount=' + pagesSettings.inlinecount);
        }
    }
    if (pageSettings.pageSize != null && pageSettings.pageNumber > 0) {
        odata.push('$skip=' + pagesSettings.pageSize * (pageSettings.pageNumber - 1));
        odata.push('$top=' + pageSettings.pageSize);
    }
    if (pageSettings.sort !== '') {
        odata.push('orderby=' + pageSettings.sort + ' ' + pageSettings.sortDir);
    }
    if (pageSettings.queryParameters !== '') {
        odeata.push(pageSettings.queryParameters);
    }
    if (odata.length > 0) {
        return this._url + '?' + odata.join('&');
    } else {
        return this._url;
    }
};

/**
    * 
    * 
    * 
    * 
    * 
    * TODO: TEST TEST TEST TEST TEST
    */
BaseRepository.prototype.Expand = function (entities, keyPropertyName, targetPropertyName, pageSettings) {
    //TODO
};

/**
    * 
    * 
    * 
    * 
    * 
    * TODO: TEST TEST TEST TEST TEST
    */
BaseRepository.prototype.ExpandDown = function (entities, keyPropertyName, propertiesArray) {
    //TODO
};

/**
    * 
    * 
    * 
    * 
    * 
    * TODO: TEST TEST TEST TEST TEST
    */
BaseRepository.prototype.GetExpandPropertiesUrl = function (propertyNameArray) {
    var _this = this;
    if (propertyNameArray === null || propertyNameArray.length < 1)
        return '';
    return '$expand=' + propertyNameArray.map(function (pn) {
        var x = _this.GetExpandPropertiesUrl(pn.subProperties);
        if (x.len < 1)
            return pn.propertyName;
        else
            return pn.propertyName + '(' + x + ')';
    }).join(',');
};

/**
    * 
    * 
    * 
    * 
    * 
    * TODO: TEST TEST TEST TEST TEST
    */
BaseRepository.prototype.IsDefferedProperty = function (entity, propertyName) {
    if (typeof entity !== 'object')
        throw 'Entity must be an object';
    var propertyVal = entity[propertyName + '@odata.navigationLink'];
    return (typeof propertyVal !== undefined && typeof propertyVal === 'string');
};

BaseRepository.prototype.doPost = function (url, postBody) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        req.open("POST", url, true);
        req.setRequestHeader("Accept", "application/json;odata.metadata=full");
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("Authorization", "LTToken " + _this._token);
        req.onload = function () {
            if (req.status == 200) {
                resolve(req.response);
            }
            else {
                reject(req.response);
            }
        };
        req.send(JSON.stringify(postBody));
    });
};

BaseRepository.prototype.doRequest = function (url) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('GET', url, true);
        req.setRequestHeader("Accept", "application/json;odata.metadata=full");
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("Authorization", "LTToken " + _this._token);
        req.onload = function () {
            if (req.status == 200) {
                resolve(req.response);
            }
            else {
                reject(req.response);
            }
        };
        req.send();
    });
};

/* EXTENSION REPOS */
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}

var ClientRepository = (function (_super) {
    __extends(ClientRepository, _super);
    function ClientRepository(url, token) {
        _super.call(this, url + LabTech.Urls.Clients, "ClientID", token);
        this.EntityReduction = function (entity) {
            if (typeof entity.ClientID !== "undefined") {
                return {
                    ClientID: entity.ClientID,
                    Name: entity.Name
                };
            }
            return entity;
        };
    }
    return ClientRepository;
})(BaseRepository);


module.exports = function (url, username, password) {

    var lt = new LabTech(url, username, password);

    return lt;
};
