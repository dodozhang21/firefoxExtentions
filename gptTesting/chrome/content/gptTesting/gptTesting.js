FBL.ns(function() { with (FBL) { 

const Cc = Components.classes;
const Ci = Components.interfaces;

const dirService = Cc["@mozilla.org/file/directory_service;1"]
    .getService(Ci.nsIProperties);

// ************************************************************************************************
// Module implementation

Firebug.NetListenerModule = extend(Firebug.Module,
{
    initialize: function(owner)
    {
        Firebug.Module.initialize.apply(this, arguments);

        // Register NetMonitor listener
        this.netListener = new NetListener();
        Firebug.NetMonitor.addListener(this.netListener);
    },

    shutdown: function()
    {
        Firebug.Module.shutdown.apply(this, arguments);

        // Unregister NetMonitor listener
        Firebug.NetMonitor.removeListener(this.netListener);
        this.netListener.outputStream.close();
    }
});

// ************************************************************************************************
// Net Panel Listener

function NetListener(outputStream)
{
    // Get unique file within user profile directory. 
    var file = dirService.get("ProfD", Ci.nsIFile);
    file.append("gptTesting");
    file.append("prodVsDev.txt");
    file.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, 0666);

    // Initialize output stream.
    this.outputStream =
        Cc["@mozilla.org/network/file-output-stream;1"]
        .createInstance(Ci.nsIFileOutputStream);

    // write, create, truncate
    this.outputStream.init(file, 0x02 | 0x08 | 0x20, 0666, 0);
}

NetListener.prototype = 
{

    onRequest: function(context, file)
    {
        if (FBTrace.DBG_NETLISTENER)
            FBTrace.sysout("netListener.onRequest; " + (file ? file.href : ""));
    },

    onExamineResponse: function(context, request)
    {
        if (FBTrace.DBG_NETLISTENER)
            FBTrace.sysout("netListener.onExamineResponse;" + request.name);
    },

    onResponse: function(context, file)
    {
        if (FBTrace.DBG_NETLISTENER)
            FBTrace.sysout("netListener.onResponse; " + (file ? file.href : ""));

        try
        {
            //var text = file.href + " (" + formatTime(file.endTime - file.startTime) + ")\n";
			

			var text = '';
			var url = file.href;
			if(file.requestNumber == 1) {
				text += "=====================================================================\n";
				text += url + "\n";
				text += "=====================================================================\n";
			} else if(url.indexOf('ad.doubleclick.net/N3865/adj/parents.mdp.com/') != -1) {

				var params = url.split(";");

				for (x in params) {
					param = params[x];
					text += param;
					text += "\n";
				}

			} else if(url.indexOf('pubads.g.doubleclick.net/gampad/') != -1) {
				text += "GPT:";
				text += "\n";
				text += url;
				text += "\n\n";

				var params = url.split("&");

				for (x in params) {
					param = params[x];
					var vals = param.split("=");
					var key = vals[0];
					var val = vals[1];
					if(key == 'iu_parts'
						|| key == 'prev_iu_szs'
						|| key == 'prev_scp'
						|| key == 'cust_params') {
						//text += "(" + key + ")\n";
						text += decodeURIComponent(val);
						text += "\n";
					}
				}
			}
			//text += file.href + " (" + formatTime(file.endTime - file.startTime) + ")\n";
			if(text != '') {
				this.outputStream.write(text, text.length);
			}

        }
        catch (err)
        {
            if (FBTrace.DBG_NETLISTENER || FBTRace.DBG_ERRORS)
                FBTrace.sysout("netListener.onResponse; EXCEPTION", err);
        }
    },

    onResponseBody: function(context, file)
    {
        if (FBTrace.DBG_NETLISTENER)
            FBTrace.sysout("netListener.onResponseBody; " + (file ? file.href : ""), file);
    },
};


function GptTestingPanel() {}
GptTestingPanel.prototype = extend(Firebug.Panel,
{
    name: "GptTesting",
    title: "GPT Testing",

    initialize: function(context, doc ) {
		Firebug.Panel.initialize.apply( this, arguments );

		this.context = context;
		this.document = doc;
		this.panelNode = doc.createElement( "div" );
		this.panelNode.ownerPanel = this;
		this.panelNode.className = "panelNode";
		this.panelNode.style.padding = "20px";
		this.panelNode.style.fontSize = "14px";
		doc.body.appendChild( this.panelNode );
    },

	getContext: function() {
		return this.context;
	},

	/*
	 * Called whenever the panel comes into view. Like toggling between browser tabs.
	 * @override
	 */
	show: function() {
		//_dump( "show: arguments=" + arguments + "\n" );

		this.panelNode.innerHTML = 'Sorry there is nothing here. Open your NET panel and the information should be logged to your %APPDATA%\\Mozilla\\Firefox\\Profiles\\{yourProfile}\\gptTesting folder.';
	},

});



// ************************************************************************************************
// Registration

Firebug.registerModule(Firebug.NetListenerModule);
Firebug.registerPanel(GptTestingPanel); 

// ************************************************************************************************
}});
